# HMS-TLS-App-ingenious-plebs-
App for the HMS Teaching Learning System.

# API
This mobile application demo uses the backend found at: https://github.com/bernard-paetzold/HMS-TLS-ingenious-plebs
In order to ensure you are able to accurately run this demo, make sure you set up the backend first.

# Testing
## Setup
There are two methods through which you can setup this application to test it.

### 1. Install APK
Install the apk found at: (link).
This apk is build for android, should you wish to have an apk for IOS, follow the second setup method below and follow the instructions to build an apk at: https://docs.expo.dev/build/setup/

### 2. Setup Expo GO
Clone this entire repository onto a PC, preferably using the IDE of your choice.
Once it has been cloned, follow the steps below:
1. Use the cd command to move to the repository directory if your terminal is not already there
2. Run `npm install` to install all dependencies. This may take a few minutes
3. Run `npx expo start` to properly initialise the app. You can immediately exit it (Ctrl+C) afterwards.
(Note, should your IDE show an error coming from tsconfig.json at this point, simply restart the IDE)
4. Install Expo go from your appstore of choice if you don't already have it
5. Run `npx expo start` again if you exited out of it earlier
6. Using the Expo Go app, scan the QR code that should now show in your terminal to bundle and run the app on your phone.

## Running
Regardless of what method used to setup the app, make sure you start up the backend using `python manage.py runserver 0.0.0.0:8000` (more information on backend's ReadMe)
Using the backend's endpoints, create a user profile for yourself, or use `python manage.py createsuperuser` (more information on backend's ReadMe)
Ensure that your phone and the PC you're hosting the backend from are connected on the same network.

One thing to note is the URL setup fields you will be greeted with on the login screen. This is purely for demo purposes as the location the server is hosted changes between people who run it.
You can find your ipv4 address using `ipconfig` (Windows), or `ifconfig` (Linux & MacOS) in your command terminal.
The port should be `8000` unless you used a different one in the aforementioned `runserver` command.

From here you should be able to login using a user profile, edit your profile details, view created assignment, and submit videos directly to the backend.
Do not that many of these areas might be empty if there are no assignments created using the backend or web-app.
