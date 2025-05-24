import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const page = new Hono();

const Layout: FC = (props) => {
  const { children } = props;
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Data Trainer!</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/alpinejs" defer></script>
      </head>
      {children}
    </html>
  );
};

const s3 = new S3Client({
  region: Deno.env.get("AWS_REGION"),
  credentials: {
    accessKeyId: Deno.env.get("AWS_ACCESS_KEY") ?? "",
    secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY") ?? "",
  },
});
const bucket = Deno.env.get("AWS_BUCKET") ?? "";
//this needs to be before the /:audio_id route, so that redirects land here first if the page is page/login
page.get("/login", (c) => {
  return c.html(
    <Layout>
      <body class="h-full flex items-center justify-center">
        <div class="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
          <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">
            Enter Access Code
          </h1>
          <form action="/auth/login" method="post" class="space-y-4">
            <div class="hidden">
              <label for="h">h</label>
              <input
                type="text"
                name="h"
                id="h"
                autocomplete="off"
                tabindex={-1}
              />
            </div>

            <div>
              <label
                for="promo"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Access Code (case sensitive)
              </label>
              <input
                type="text"
                id="promo"
                name="promo"
                required
                placeholder="Your promo code"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              class="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </body>
    </Layout>
  );
});

page.get("/:audio_id", async (c) => {
  const { audio_id } = c.req.param();
  let url;
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: `audio/${audio_id}.wav`,
    });

    url = await getSignedUrl(s3, command, { expiresIn: 60 });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return c.text("Error generating signed URL", 500);
  }

  return c.html(
    <Layout>
      <body class="bg-gray-100 min-h-screen flex items-center justify-center">
        <script>
          {` document.getElementById('myForm').addEventListener('submit', async function (e) {
      e.preventDefault(); // prevent the default form submission

      const form = e.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('/api/submission/${audio_id}', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        document.getElementById('response').textContent = 'Success: ' + JSON.stringify(result);
      } catch (error) {
        document.getElementById('response').textContent = 'Error: ' + error.message;
      }`}
        </script>
        <div class="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto my-10">
          <h1 class="text-2xl font-bold mb-4 text-center">Tag the Emotion</h1>

          <audio class="w-full mb-4" controls>
            <source src={url ?? "sample.wav"} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>

          <form
            action={`/api/submission/${audio_id}`}
            method="post"
            class="space-y-4"
          >
            <div>
              <label class="block text-lg font-medium mb-2">
                Select Emotions:
              </label>
              <div class="space-y-2">
                <label class="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="emotion"
                    value="Fear"
                    class="accent-indigo-600"
                  />
                  <span>Fear</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="emotion"
                    value="Grief"
                    class="accent-indigo-600"
                  />
                  <span>Grief</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="emotion"
                    value="Anger"
                    class="accent-indigo-600"
                  />
                  <span>Anger</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="emotion"
                    value="Helplessness"
                    class="accent-indigo-600"
                  />
                  <span>Helplessness</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-lg font-medium mb-2">
                Select Intensity:
              </label>
              <div class="flex justify-between">
                <label class="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="intensity"
                    value="strong"
                    class="accent-indigo-600"
                  />
                  <span>strong</span>
                </label>
                <label class="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="intensity"
                    value="light"
                    class="accent-indigo-600"
                  />
                  <span>light</span>
                </label>
                <label class="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="intensity"
                    value="neutral"
                    class="accent-indigo-600"
                  />
                  <span>neutral</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              class="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </body>
    </Layout>
  );
});

export default page;
