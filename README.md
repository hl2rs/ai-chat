# GET STARTED:
> 𝐂𝐨𝐧𝐯𝐞𝐫𝐬𝐚𝐭𝐢𝐨𝐧𝐚𝐥 𝐀𝐈 𝐛𝐨𝐭 𝐰𝐢𝐭𝐡 𝐜𝐮𝐬𝐭𝐨𝐦𝐢𝐳𝐚𝐛𝐥𝐞 𝐛𝐞𝐡𝐚𝐯𝐢𝐨𝐫 𝐚𝐧𝐝 𝐫𝐚𝐠 𝐚𝐛𝐢𝐥𝐢𝐭𝐲 <br /><br />
‣ Create a account at https://groq.com <br />
‣ Create an API Key <br />
‣ Add your GROQ API Key to "Bearer API_KEY_HERE" found in script.js <br />
‣ Update system-behavior.txt to your desired system prompt. This file will determine the behavior of the AI <br />
‣ Add any text you wish to refer to to rag.txt <br />

# INSTALL NODE.JS:
> 𝐈𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐢𝐨𝐧 𝐨𝐟 𝐧𝐨𝐝𝐞.𝐣𝐬 𝐢𝐬 𝐜𝐫𝐢𝐭𝐢𝐜𝐚𝐥 𝐭𝐨 𝐭𝐡𝐞 𝐟𝐮𝐧𝐜𝐭𝐢𝐨𝐧𝐚𝐥𝐢𝐭𝐲 <br /><br />
‣ Open up your terminal and type npm install express body-parser cors @google-cloud/text-to-speech dotenv <br />

# ENABLING VOICE:
> 𝐓𝐡𝐞 𝐯𝐨𝐢𝐜𝐞 𝐟𝐞𝐚𝐭𝐮𝐫𝐞 𝐮𝐬𝐞𝐬 𝐆𝐨𝐨𝐠𝐥𝐞's 𝐭𝐞𝐱𝐭 𝐭𝐨 𝐬𝐩𝐞𝐞𝐜𝐡 𝐀𝐏𝐈, 𝐬𝐨 𝐚 𝐆𝐂𝐏 𝐚𝐜𝐜𝐨𝐮𝐧𝐭 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐧𝐞𝐞𝐝𝐞𝐝​ <br /><br />
https://cloud.google.com/text-to-speech/docs/before-you-begin <br />
‣ Once the API in enabled, update the text-to-speech.json file with your GCP service account key file <br />

# START THE AI:
> 𝐓𝐡𝐢𝐬 𝐰𝐢𝐥𝐥 𝐚𝐥𝐥𝐨𝐰 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐩𝐫𝐨𝐣𝐞𝐜𝐭 𝐭𝐨 𝐬𝐭𝐚𝐫𝐭. 𝐓𝐡𝐞 𝐟𝐨𝐥𝐥𝐨𝐰 𝐧𝐞𝐞𝐝𝐬 𝐭𝐨 𝐛𝐞 𝐢𝐧 𝐭𝐡𝐞 𝐞𝐱𝐚𝐜𝐭 𝐨𝐫𝐝𝐞𝐫 𝐝𝐞𝐬𝐜𝐫𝐢𝐛𝐞𝐝 <br /><br />
‣ Open up your terminal and start the text-to-speech.json using the command $env:GOOGLE_APPLICATION_CREDENTIALS = "URL_PATH_TO_TEXT_TO_SPEECH_FILE" - this can be found commented out at bottom of server.js <br />
‣ In your terminal, type node server.js <br />
‣ Turn on your local live server, make sure that you are using Port: 5000 <br />
‣  navigate to chatbot.html <br />
