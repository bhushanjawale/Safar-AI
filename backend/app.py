from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv
import os, json, re, time, requests

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r'/api/*': {'origins': '*'}})

@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
GEMINI_STREAM_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent'

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

def groq_chat(messages, model='llama-3.1-8b-instant', timeout=20):
    try:
        res = requests.post(
            GROQ_URL,
            headers={
                'Authorization': f'Bearer {GROQ_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={'model': model, 'messages': messages, 'max_tokens': 1024, 'temperature': 0.7},
            timeout=timeout
        )
        if res.status_code == 200:
            return res.json()['choices'][0]['message']['content']
    except Exception:
        pass
    return None

def gemini(prompt, timeout=30):
    for attempt in range(3):
        try:
            res = requests.post(
                GEMINI_URL,
                params={'key': GEMINI_API_KEY},
                headers={'Content-Type': 'application/json'},
                json={'contents': [{'parts': [{'text': prompt}]}]},
                timeout=timeout
            )
            if res.status_code == 200:
                return res.json()['candidates'][0]['content']['parts'][0]['text']
            if res.status_code == 429 and attempt < 2:
                time.sleep(3 * (attempt + 1))
                continue
            break
        except Exception as e:
            if attempt < 2:
                time.sleep(3)
    return None


# ── Recommendations ────────────────────────────────────────────────────────────
@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    prefs = request.json or {}
    location   = prefs.get('location', 'India')
    interests  = prefs.get('interests', [])
    budget     = prefs.get('budget', 'balanced')
    trip_style = prefs.get('tripStyle', 'explorer')
    offbeat    = prefs.get('offbeat', False)

    prompt = f"""Based on these travel preferences, recommend destinations in India near {location} (within 300-500 km):
- Interests: {', '.join(interests) or 'general'}
- Budget: {budget}
- Trip Style: {trip_style}
- Offbeat: {'Yes' if offbeat else 'No'}

Return ONLY a JSON array (min 10 items):
[{{"name":"","state":"","distance":0,"budget":"₹X–₹Y","duration":"","tags":[],"rating":0.0,"reason":""}}]"""

    text = gemini(prompt, timeout=15)
    if text:
        m = re.search(r'\[.*\]', text, re.DOTALL)
        if m:
            try:
                return jsonify({'destinations': json.loads(m.group())})
            except Exception:
                pass
    return jsonify({'destinations': _default_recommendations()})


# ── Nearby ─────────────────────────────────────────────────────────────────────
@app.route('/api/nearby', methods=['POST'])
def get_nearby():
    data     = request.json or {}
    location = data.get('location', 'India')

    prompt = f"""List popular travel destinations near {location} within 300-500 km.
Return ONLY a JSON array (min 8 items):
[{{"name":"","state":"","distance":0,"budget":"₹X–₹Y","duration":"","tags":[],"rating":0.0}}]"""

    text = gemini(prompt, timeout=15)
    if text:
        m = re.search(r'\[.*\]', text, re.DOTALL)
        if m:
            try:
                return jsonify({'destinations': json.loads(m.group())})
            except Exception:
                pass
    return jsonify({'destinations': _default_nearby()})


# ── Itinerary ──────────────────────────────────────────────────────────────────
@app.route('/api/itinerary/generate', methods=['POST'])
def generate_itinerary():
    data        = request.json or {}
    source      = data.get('source', '')
    destination = data.get('destination', '')
    days        = data.get('days', 3)
    budget      = data.get('budget', 'balanced')

    prompt = f"""Create a detailed travel plan from {source} to {destination} for {days} days ({budget} budget).
Return ONLY valid JSON with no markdown and no code blocks:
{{"flights":[{{"airline":"","departure":"","arrival":"","duration":"","price":"₹","class":""}}],"trains":[{{"name":"","number":"","departure":"","arrival":"","duration":"","price":"₹","class":""}}],"cabs":[{{"type":"","service":"","route":"","price":"₹","duration":""}}],"hotels":[{{"name":"","rating":0.0,"location":"","pricePerNight":"₹","amenities":[],"type":"{budget}"}}],"itinerary":[{{"day":1,"title":"","activities":[{{"time":"","activity":"","description":"","duration":"","cost":"₹"}}],"meals":[{{"type":"","restaurant":"","cuisine":"","cost":"₹"}}]}}]}}
Provide 2-3 options each for flights/trains/cabs/hotels and {days} days of itinerary."""

    def stream():
        try:
            res = requests.post(
                GEMINI_STREAM_URL,
                params={'key': GEMINI_API_KEY},
                headers={'Content-Type': 'application/json'},
                json={'contents': [{'parts': [{'text': prompt}]}]},
                stream=True,
                timeout=60
            )
            if res.status_code != 200:
                yield f"data: {json.dumps({'error': f'Gemini error {res.status_code}: {res.text}'})}\n\n"
                return

            full_text = ''
            buf = ''
            for raw_chunk in res.iter_content(chunk_size=None):
                if not raw_chunk:
                    continue
                buf += raw_chunk.decode('utf-8') if isinstance(raw_chunk, bytes) else raw_chunk
                # Gemini streams a JSON array — each complete object ends with },\n or }\n
                while True:
                    # Find a complete top-level JSON object in the buffer
                    try:
                        stripped = buf.lstrip(',\n\r ')
                        obj, idx = json.JSONDecoder().raw_decode(stripped)
                        buf = stripped[idx:]
                        items = obj if isinstance(obj, list) else [obj]
                        for item in items:
                            token = item.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                            if token:
                                full_text += token
                                yield f"data: {json.dumps({'chunk': token})}\n\n"
                    except (ValueError, IndexError):
                        break

            m = re.search(r'\{.*\}', full_text, re.DOTALL)
            if m:
                try:
                    itinerary_data = json.loads(m.group())
                    if 'itinerary' in itinerary_data:
                        yield f"data: {json.dumps({'done': True, 'data': itinerary_data})}\n\n"
                        return
                except Exception:
                    pass
            yield f"data: {json.dumps({'error': 'Failed to parse itinerary. Please try again.'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return Response(stream_with_context(stream()), mimetype='text/event-stream',
                    headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'})


# ── Flights (Groq) ────────────────────────────────────────────────────────────
@app.route('/api/flights/search', methods=['POST'])
def search_flights():
    data = request.json or {}
    from_city  = data.get('from', '')
    to_city    = data.get('to', '')
    date       = data.get('date', '')
    passengers = data.get('passengers', 1)
    cabin      = data.get('cabin_class', 'economy')

    messages = [
        {'role': 'system', 'content': 'You are a flight data API. Return ONLY valid JSON arrays, no explanation, no markdown.'},
        {'role': 'user', 'content': f'List 4-6 realistic flight options from {from_city} to {to_city} on {date} for {passengers} passenger(s) in {cabin} class. Use Indian airlines (IndiGo, Air India, SpiceJet, Vistara, AirAsia India). Return ONLY a JSON array with fields: airline, flight_number, departure_time, arrival_time, from_code, to_code, duration, stops, cabin_class, price, amenities.'}
    ]

    try:
        text = groq_chat(messages)
        if text:
            m = re.search(r'\[.*\]', text, re.DOTALL)
            if m:
                return jsonify({'success': True, 'flights': json.loads(m.group())})
        return jsonify({'success': False, 'error': 'No data returned from Groq'}), 500
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


# ── Hotels (Groq) ─────────────────────────────────────────────────────────────
@app.route('/api/hotels/search', methods=['POST'])
def search_hotels():
    data   = request.json or {}
    city   = data.get('city', '')
    budget = data.get('budget', 'mid')
    guests = data.get('guests', 2)
    rooms  = data.get('rooms', 1)
    prop_types = data.get('property_types', [])
    check_in   = data.get('check_in', '')
    check_out  = data.get('check_out', '')

    budget_map = {'budget': 'under ₹2000/night', 'mid': '₹2000-₹6000/night', 'luxury': 'above ₹6000/night'}
    budget_label = budget_map.get(budget, 'mid-range')
    type_hint = f" Focus on {', '.join(prop_types)} properties." if prop_types else ''

    messages = [
        {'role': 'system', 'content': 'You are a hotel data API. Return ONLY valid JSON arrays, no explanation, no markdown.'},
        {'role': 'user', 'content': f'List 5-7 realistic hotel options in {city} for {guests} guests, {rooms} room(s), {budget_label} budget.{type_hint} Use real or realistic hotel names in {city}. Prices in INR. Return ONLY a JSON array with fields: name, type, location, rating, price_per_night, amenities, highlight.'}
    ]

    try:
        text = groq_chat(messages)
        if text:
            m = re.search(r'\[.*\]', text, re.DOTALL)
            if m:
                return jsonify({'success': True, 'hotels': json.loads(m.group())})
        return jsonify({'success': False, 'error': 'No data returned from Groq'}), 500
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


# ── Chat (Groq) ────────────────────────────────────────────────────────────────
@app.route('/api/chat', methods=['POST'])
def chat():
    data     = request.json or {}
    message  = data.get('message', '')
    history  = data.get('history', [])  # [{"role":"user"|"assistant", "content":"..."}]

    system_msg = {
        'role': 'system',
        'content': (
            'You are Safar AI, a friendly and knowledgeable travel assistant specialising in Indian travel. '
            'Be concise, warm, and helpful. Use bullet points (•) for lists. '
            'Format key info in bold using **text**. Keep responses focused and under 300 words unless a detailed itinerary is requested.'
        )
    }

    messages = [system_msg] + history + [{'role': 'user', 'content': message}]
    text = groq_chat(messages)

    if text:
        return jsonify({'success': True, 'response': text})

    # Fallback to Gemini if Groq fails
    fallback = gemini(f"You are Safar AI, a helpful travel assistant for India.\nUser: {message}\nAssistant:")
    if fallback:
        return jsonify({'success': True, 'response': fallback})

    return jsonify({'error': 'Chat unavailable. Please try again.'}), 500


# ── Defaults ───────────────────────────────────────────────────────────────────
def _default_recommendations():
    return [
        {"name":"Goa","state":"Goa","distance":450,"budget":"₹8,000–₹15,000","duration":"3-4 days","tags":["beaches","nightlife"],"rating":4.7,"reason":"Perfect beach getaway"},
        {"name":"Lonavala","state":"Maharashtra","distance":85,"budget":"₹3,000–₹6,000","duration":"1-2 days","tags":["hills","nature"],"rating":4.3,"reason":"Scenic hill station near Mumbai"},
        {"name":"Udaipur","state":"Rajasthan","distance":750,"budget":"₹10,000–₹20,000","duration":"3-4 days","tags":["heritage","lakes"],"rating":4.8,"reason":"City of lakes and palaces"},
        {"name":"Pondicherry","state":"Puducherry","distance":1350,"budget":"₹7,000–₹12,000","duration":"2-3 days","tags":["beaches","french"],"rating":4.6,"reason":"French colonial charm"},
        {"name":"Mahabaleshwar","state":"Maharashtra","distance":265,"budget":"₹5,000–₹10,000","duration":"2-3 days","tags":["hills","viewpoints"],"rating":4.5,"reason":"Stunning hill viewpoints"},
        {"name":"Alibaug","state":"Maharashtra","distance":95,"budget":"₹4,000–₹8,000","duration":"1-2 days","tags":["beaches","forts"],"rating":4.2,"reason":"Coastal town with forts"},
        {"name":"Pune","state":"Maharashtra","distance":100,"budget":"₹4,000–₹8,000","duration":"1-2 days","tags":["beaches","forts"],"rating":4.2,"reason":"Cultural city with vibrant food scene"},
    ]

def _default_nearby():
    return [
        {"name":"Lonavala","state":"Maharashtra","distance":85,"budget":"₹3,000–₹6,000","duration":"1-2 days","tags":["hills","nature"],"rating":4.3},
        {"name":"Alibaug","state":"Maharashtra","distance":95,"budget":"₹4,000–₹8,000","duration":"1-2 days","tags":["beaches","forts"],"rating":4.2},
        {"name":"Matheran","state":"Maharashtra","distance":90,"budget":"₹3,500–₹7,000","duration":"1-2 days","tags":["hills","trekking"],"rating":4.4},
        {"name":"Nashik","state":"Maharashtra","distance":165,"budget":"₹4,000–₹8,000","duration":"2-3 days","tags":["temples","vineyards"],"rating":4.3},
        {"name":"Pune","state":"Maharashtra","distance":150,"budget":"₹5,000–₹10,000","duration":"2-3 days","tags":["culture","food"],"rating":4.5},
        {"name":"Mahabaleshwar","state":"Maharashtra","distance":265,"budget":"₹5,000–₹10,000","duration":"2-3 days","tags":["hills","viewpoints"],"rating":4.5},
        {"name":"Goa","state":"Goa","distance":450,"budget":"₹8,000–₹15,000","duration":"3-4 days","tags":["beaches","nightlife"],"rating":4.7},
        {"name":"Igatpuri","state":"Maharashtra","distance":120,"budget":"₹2,500–₹5,000","duration":"1-2 days","tags":["nature","waterfalls"],"rating":4.1},
    ]


if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0', use_reloader=False)
