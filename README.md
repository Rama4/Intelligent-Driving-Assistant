# Instructions on how to install and run the app:

**NOTE:** all commands given below are run with respect to the repository root.

## Make sure you install the following prerequisites in your system before proceeding:

    npm
    yarn
    python
    pip
    android studio

## Create virtual environment in src folder

    cd src
    pip install virtualenv
    python -m venv project_env

## activate the virtual environment inside src/project_env

if you are using cmd from src:

    cd project_env/Scripts
    activate

if you are using git bash from src:

    cd src
    source project_env/Scripts/activate

## install dependancies from src/requirements.txt

    cd src
    pip install -r requirements.txt

## install the client's packages

    cd client
    yarn install

or if you use npm

    cd client
    npm install

## copy the artists.zip to src folder and extract there.

## Run the server locally in a seperate terminal (Make sure you have activated the python virtual environment):

    cd  src/DarkWebScraperServer
    python manage.py runserver 0.0.0.0:8000

## Enter the IPv4 address of the PC in the client/.env file

Run "ipconfig" command in Windows to find the IPv4 address.
Set the IP value in .env file to that value.
example:

    IP=192.168.0.10

This is so that the mobile app client can connect to the django server on the PC.

## Run the client

Make sure the android phone is connected to the PC and its ID is listed with this command : "adb devices"

    cd client
    yarn start

This will start the metro server, and the logs will be visible in it.

NOTE:

1. keep the phone connected to the PC for this command.
2. make sure the phone/emulator is connected to the internet.

Now you can interact with the app.
