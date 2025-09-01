from django.shortcuts import HttpResponse
from django.http import JsonResponse
from django.http import StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
import os
import base64
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

# Import our recommendation modules
from .music_recommendations.collaborative_rec import ImplicitRecommender, ArtistDesc
from .music_recommendations.content_based_rec import ContentBasedRecommendationEngine

# Initialize recommendation engines
content_based_engine = ContentBasedRecommendationEngine()
artist_desc = ArtistDesc()

MEDIA_ROOT = '/Music'

def landing(request):
    response = HttpResponse("hi da")
    response['Access-Control-Allow-Origin'] = 'null'
    return response

def getFilePath(folderName, fileName):
    return os.path.join(folderName, fileName)

@csrf_exempt
def get_collaborative_recommendations(request):
    """
    Get music recommendations based on collaborative filtering
    Query params:
    - location: location to filter artists by
    - country: country to filter artists by
    - user_id: user ID to get recommendations for (default: 2)
    - n: number of recommendations to return (default: 100)
    """
    try:
        location = request.GET.get('location', '')
        country = request.GET.get('country', '')
        user_id = int(request.GET.get('user_id', 2))
        n = int(request.GET.get('n', 100))

        # Load user artists matrix
        user_artists = artist_desc.load_user_artists()
        
        # Initialize and fit the model
        implicit_model = implicit.als.AlternatingLeastSquares(
            factors=50, iterations=10, regularization=0.01
        )
        recommender = ImplicitRecommender(artist_desc, implicit_model)
        recommender.fit(user_artists)
        
        # Get recommendations
        artists, scores = recommender.recommend(user_id, user_artists, n=n)
        
        # Filter by location if provided
        if location and country:
            artist_location_filtered = artist_desc.artist_location_filter(location, country)
            filtered_results = []
            for artist, score in zip(artists, scores):
                if artist_location_filtered['artist_mb'].str.contains(artist, case=False).any():
                    filtered_results.append({
                        'artist': artist,
                        'score': float(score)
                    })
            results = filtered_results
        else:
            results = [{'artist': artist, 'score': float(score)} for artist, score in zip(artists, scores)]

        response = JsonResponse({
            'success': True,
            'recommendations': results
        })
    except Exception as e:
        response = JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)
    
    response['Access-Control-Allow-Origin'] = 'null'
    return response

@csrf_exempt
def get_content_based_recommendations(request):
    """
    Get music recommendations based on content (lyrics) similarity
    Query params:
    - song: song name to get recommendations for
    - n: number of recommendations to return (default: 4)
    """
    try:
        song = request.GET.get('song')
        n = int(request.GET.get('n', 4))
        
        if not song:
            raise ValueError("Song parameter is required")

        recommendation = {
            'song': song,
            'number_tracks': n
        }
        
        recommendations = content_based_engine.recommend(recommendation)
        
        results = [{
            'song': rec[1],
            'artist': rec[2],
            'similarity_score': float(rec[0])
        } for rec in recommendations]

        response = JsonResponse({
            'success': True,
            'recommendations': results
        })
    except Exception as e:
        response = JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)
    
    response['Access-Control-Allow-Origin'] = 'null'
    return response

@csrf_exempt
def upload(request):
    print('upload:')
    if request.method == 'POST':
        filename = request.POST['fileName']
        chunk_data = request.POST['chunkData']
        chunk_index = int(request.POST['chunkIndex'])
        total_chunks = int(request.POST['totalChunks'])
        
        fileChunkName = getFilePath('caller', f'{filename}_{chunk_index}')
        fileFinalName = getFilePath('caller', filename)

        # Store the chunk data in a temporary location
        with open(fileChunkName, 'wb') as chunk_file:
            chunk_file.write(base64.b64decode(chunk_data))
        
        # Check if all chunks have been received
        response = HttpResponse('MP3 file uploaded successfully')
        
        if chunk_index == total_chunks - 1:
            # Reassemble the chunks into the original file
            with open(fileFinalName, 'wb') as mp3_file:
                for i in range(total_chunks):
                    with open(getFilePath('caller', f'{filename}_{i}'), 'rb') as chunk_file:
                        mp3_file.write(chunk_file.read())
            
            # Remove temporary chunk files
            for i in range(total_chunks):
                os.remove(getFilePath('caller', f'{filename}_{i}'))
        else:
            response = HttpResponse('MP3 file upload fail!')

        response['Access-Control-Allow-Origin'] = 'null'
        return response
    else:
        print("Error while uploading file")
        return HttpResponse('Invalid request method')

@csrf_exempt
def upload_mp3(request):
    return upload(request)

def download_file(request):
    print('download_file() nana')
    filename = request.GET['fileName']
    file_path = getFilePath('caller', filename)
    if os.path.exists(file_path):
        print('file exists on server')
        with open(file_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type='application/force-download')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
    else:
        return HttpResponse('File not found', status=404)

def list_pending_files(request):
    print('list_pending_files()')
    folderpath = 'caller'
    if os.path.exists(folderpath):
        file_names = []
        for file in os.listdir(folderpath):
            if os.path.isfile(os.path.join(folderpath, file)):
                file_names.append(file)
        return JsonResponse({'file_names': file_names})
    else:
        return HttpResponse('Folder not found in server.', status=500)

def driving_score(carSpeed, carPeaks, carRoadCondition):
    peak = ctrl.Antecedent(np.arange(0, 11, 1), 'peak')
    road_condition = ctrl.Antecedent(np.arange(0, 2, 1), 'road_condition')
    speed = ctrl.Antecedent(np.arange(10, 81, 1), 'speed')  
    driver_score = ctrl.Consequent(np.arange(0, 101, 1), 'driver_score')
    
    peak['low'] = fuzz.trimf(peak.universe, [0, 0, 5])
    peak['medium'] = fuzz.trimf(peak.universe, [0, 5, 10])
    peak['high'] = fuzz.trimf(peak.universe, [5, 10, 10])

    road_condition['low'] = fuzz.trapmf(road_condition.universe, [0, 0, 0.5, 1])
    road_condition['high'] = fuzz.trapmf(road_condition.universe, [0.5, 1, 1, 1])

    speed['low'] = fuzz.trimf(speed.universe, [10, 10, 30])
    speed['medium'] = fuzz.trimf(speed.universe, [20, 45, 70])  
    speed['high'] = fuzz.trimf(speed.universe, [60, 80, 80])

    driver_score['very_low'] = fuzz.trimf(driver_score.universe, [0, 0, 20])
    driver_score['low'] = fuzz.trimf(driver_score.universe, [10, 30, 50])
    driver_score['medium'] = fuzz.trimf(driver_score.universe, [40, 60, 80])
    driver_score['high'] = fuzz.trimf(driver_score.universe, [70, 90, 100])

    rules = [
        ctrl.Rule(peak['low'] & road_condition['high'] & speed['low'], driver_score['high']),
        ctrl.Rule(peak['medium'] & road_condition['low'] & speed['medium'], driver_score['medium']),
        ctrl.Rule(peak['high'] & road_condition['high'] & speed['low'], driver_score['high']),
        ctrl.Rule(peak['low'] & road_condition['high'] & speed['high'], driver_score['medium']),
        ctrl.Rule(peak['medium'] & road_condition['low'] & speed['medium'], driver_score['low']),
        ctrl.Rule(peak['high'] & road_condition['low'] & speed['medium'], driver_score['very_low']),
        ctrl.Rule(peak['low'] & road_condition['high'] & speed['low'], driver_score['high']),
        ctrl.Rule(peak['medium'] & road_condition['high'] & speed['medium'], driver_score['high']),
        ctrl.Rule(peak['high'] & road_condition['low'] & speed['low'], driver_score['low']),
        ctrl.Rule(peak['low'] & road_condition['low'] & speed['high'], driver_score['very_low']),
        ctrl.Rule(peak['high'] & road_condition['high'] & speed['high'], driver_score['very_low']),
        ctrl.Rule(peak['medium'] & road_condition['high'] & speed['high'], driver_score['medium']),
        ctrl.Rule(peak['low'] & road_condition['low'] & speed['low'], driver_score['low']),
        ctrl.Rule(peak['high'] & road_condition['low'] & speed['low'], driver_score['low'])
    ]

    driver_score_ctrl = ctrl.ControlSystem(rules)
    driver_score_simulation = ctrl.ControlSystemSimulation(driver_score_ctrl)
    
    driver_score_simulation.input['peak'] = int(carPeaks)
    driver_score_simulation.input['road_condition'] = int(carRoadCondition)
    driver_score_simulation.input['speed'] = int(carSpeed)

    driver_score_simulation.compute()
    return driver_score_simulation.output['driver_score']

def check_collision(request):
    file_path = '../Collision/myfile.txt'
    accelerometer_collision = request.GET.get('acc', False)
    peaks = request.GET.get('peak', 5)
    roadCondition = request.GET.get('roadCondition', 0)
    speed_val = 25 if roadCondition == 1 else 45
    speed = request.GET.get('speed', speed_val)
    
    dScore = driving_score(speed, peaks, roadCondition)
    
    collision = False
    if os.path.exists(file_path) and accelerometer_collision:
        collision = True

    response = JsonResponse({
        "collision": collision,
        "drivingscore": dScore
    })
    response['Access-Control-Allow-Origin'] = 'null'
    return response