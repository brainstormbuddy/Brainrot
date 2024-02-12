The purpose of this project, [brainrot.js](https://brainrotjs.com) was to provide a seamless way to generate a short form video on any topic from multiple interesting personalities to extend my pursuit of making education more fun, intuitive, and absurd. 

We used various tools from the front to backend:

front end: Next.js, tailwind.css, tRPC, express.
backend: Docker, Express, PyTorch, Python, Flask, NodeJS, Remotion, OpenAI API, ElevenLabs API, Google Oauth, Google Custom Search Engine.
architecture: CloudFront, S3, Lambda, EC2, Vercel.

I ran into a ton of weird challenges. GLIBC incompatibility issues, rendering times of 8-15 mins (which is why I had to opt into using serverless parallelized computing, reducing it to 1 minute rendering!). Also, designing the whole rather complex architecture was quite the can of worms. Also, enforcing the google custom search engine to only return images which are publicly available was quite hard, but crucial as this is executed after much expensive laborious computation like transcript generation, audio subtitle inference generation, and more, so it is crucial it never becomes the bottleneck. 

Public API's we used: Google Custom Search Engine API, OpenAI API, ElevelLabs API, AWS NodeJS SDK.

How to run locally:

check the .env.example file to see all necessary environment variables. But you will need a google custom search api credentials, eleven labs credentials, open ai credentials, remotion aws credentials, aws credentials, and a database. Once you have these, running the generator is as simple as

1. npm install
2. python3 transcribe.py
3. node build.mjs

Bear in mind the build.mjs is built for [brainrotjs.com](https://brainrotjs.com), so you will need to edit it some, but it is mostly the same.

Enjoy ;)