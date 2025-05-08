This is a Next.JS PWA built to upload photos to a shared network drive connected to the server host. 

To get started:

1. Install Node.js version 20 or higher + npm or your package manager of choice.
2. Clone the project and navigate to the root directory of the project by command line/terminal
3. Install the project dependancies:
    npm i

To enable PWA downloads and the accompanying functionality such as local device storage access to delete photos from device after upload, you must generate and install local CA certificates.

Local CA Setup:
1. Install MKCert and OpenSSL
    choco install openssl -y
    choco install mkcert -y
2. Install local CA
    mkcert -install
3. Generate Certificates
    mkcert [hostname] [ip] 
    ie. mkcert localhost 10.0.0.105
4. Generate CRT from Certificates
    mkcert -CAROOT
    Navigate to path returned and run
    openssl x509 -in rootCA.pem -outform DER -out rootCA.crt
5. Add certificate files (.pem and -key.pem) to the root folder of the project, and add the .crt to the root of /public for user downloads

ENV file must contain:

UPLOAD_DIR - Network drive as it is mapped on the server host, as well as optional destination path. Must end in / - ie. S:/ or X:/Uploads/
PORT - Port to run application on - ie. 3000 or 8080
HOST - IP of server host - ie. 10.0.0.105
KEY - location/filename of SSL key - ie. localhost+1-key.pem if stored in root directory
PEM - location/filename of SSL cert - ie. localhost+1.pem if stored in root directory