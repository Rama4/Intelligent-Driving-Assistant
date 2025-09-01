import implicit
import scipy
import pandas as pd
from pathlib import Path
from typing import Tuple, List

# Update data path to be relative to Django project
DATA_PATH = 'myapp/music_recommendations/data'
DATA_FILE_NAME = 'artists.csv'
ZIP_FILE_NAME = 'artists.zip'

def artists_loader(artists_loc: Path) -> scipy.sparse.csr_matrix:
    artist_preferences = pd.read_csv(artists_loc, sep="\t")
    artist_preferences.set_index(["userID", "artistID"], inplace=True)
    coo = scipy.sparse.coo_matrix(
        (
            artist_preferences.weight.astype(float),
            (
                artist_preferences.index.get_level_values(0),
                artist_preferences.index.get_level_values(1),
            ),
        )
    )
    return coo.tocsr()


class ArtistDesc:

    def __init__(self):
        self._artists_df = None

    def artist_id_2_data(self, artist_id: int):
        parsed = self._artists_df.loc[self._artists_df['id'] == artist_id, 'artist_lastfm'].tolist()
        return parsed[0]

    def artist_location_filter(self, location: str, country: str):
        self._artists_df = self._artists_df[self._artists_df['country_mb'].str.contains(country)]
        temp = self._artists_df[self._artists_df['tags_lastfm'].str.contains(location,na=False)]
        return temp

    def extract_zip(self, path: str):
        import zipfile
        import os
        
        zip_path = os.path.join(path, ZIP_FILE_NAME)
        extract_path = os.path.join(path, '')  # Empty string to extract to same directory
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)

    def get_artists(self, artists_file: Path) -> None:
        import os
        
        csv_path = os.path.join(DATA_PATH, DATA_FILE_NAME)
        
        if not os.path.exists(csv_path):
            os.makedirs(DATA_PATH, exist_ok=True)
            self.extract_zip(DATA_PATH)
        
        artists_csv = pd.read_csv(csv_path)
        artists_csv_filtered = artists_csv.dropna()
        art_filtered_sorted = artists_csv_filtered.sort_values(by='listeners_lastfm', ascending=False)
        art_filtered_sorted.insert(0, 'id', range(1, 1 + len(art_filtered_sorted)))
        artists_df = art_filtered_sorted
        print(art_filtered_sorted.shape)
        self._artists_df = art_filtered_sorted

class ImplicitRecommender:

    def __init__(
        self,
        artist_desc: ArtistDesc,
        implicit_model: implicit.recommender_base.RecommenderBase,
    ):
        self.artist_desc = artist_desc
        self.implicit_model = implicit_model

    def fit(self, user_artists_matrix: scipy.sparse.csr_matrix) -> None:
        self.implicit_model.fit(user_artists_matrix)

    def recommend(
        self,
        user_id: int,
        user_artists_matrix: scipy.sparse.csr_matrix,
        n: int = 10,
    ) -> Tuple[List[str], List[float]]:
        artist_ids, scores = self.implicit_model.recommend(
            user_id, user_artists_matrix[n], N=n
        )
        print(artist_ids)
        artists = [
            self.artist_desc.artist_id_2_data(artist_id)
            for artist_id in artist_ids
        ]
        return artists, scores
