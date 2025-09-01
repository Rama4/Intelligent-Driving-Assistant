from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

def test_upload_mp3(self):
    client = APIClient()
    url = reverse('upload-mp3')
    with open('~/Downloads/ttsmaker-file-2023-9-16-11-56-36.mp3', 'rb') as mp3_file:
        response = client.post(url, {'mp3_file': mp3_file}, format='multipart')
    self.assertEqual(response.status_code, 200)