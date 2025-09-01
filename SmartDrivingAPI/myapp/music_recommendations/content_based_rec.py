import numpy as n
import pandas as p
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict

# Update data path to be relative to Django project
DATA_PATH = 'myapp/music_recommendations/data'

class ContentBasedRecommendationEngine:
    def __init__(self):
        self.tracks = None
        self.similarity_arr = None
        self.initialize_model()

    def initialize_model(self):
        # Load and preprocess data
        self.tracks = p.read_csv(f'{DATA_PATH}/songdata.csv')
        self.tracks = self.tracks.sample(n=5000).drop('link', axis=1).reset_index(drop=True)
        self.tracks['text'] = self.tracks['text'].str.replace(r'\n', '')

        # Create TF-IDF matrix
        termFreqIDF = TfidfVectorizer(analyzer='word', stop_words='english')
        songLyricDataMtrx = termFreqIDF.fit_transform(self.tracks['text'])

        # Calculate cosine similarity
        cos_similarity_arr = cosine_similarity(songLyricDataMtrx)

        # Create similarity dictionary
        self.similarity_arr = {}
        for i in range(len(cos_similarity_arr)):
            similarityIndexes = cos_similarity_arr[i].argsort()[:-50:-1]
            self.similarity_arr[self.tracks['song'].iloc[i]] = [
                (cos_similarity_arr[i][x], self.tracks['song'][x], self.tracks['artist'][x]) 
                for x in similarityIndexes
            ][1:]

    def _print_message(self, track, curr_recommendation):
        recommendedItems = len(curr_recommendation)
        
        print(f'The {recommendedItems} recommended tracks for {track} are:')
        for i in range(recommendedItems):
            print(f"Track {i+1}:")
            print(f"{curr_recommendation[i][1]} by {curr_recommendation[i][2]} with {round(curr_recommendation[i][0], 3)} matching score")

    def recommend(self, recommendation):
        track = recommendation['song']
        number_tracks = recommendation['number_tracks']
        curr_recommendation = self.similarity_arr[track][:number_tracks]
        return curr_recommendation
