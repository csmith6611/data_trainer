FROM denoland/deno:2.3.3

ENV PORT=${PORT}
ENV JWT_SECRET=${JWT_SECRET}

ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV AWS_ACCESS_KEY=${AWS_ACCESS_KEY}
ENV AWS_BUCKET=${AWS_BUCKET}
ENV AWS_REGION=${AWS_REGION}

# Set the working directory
WORKDIR /app
# Copy the necessary files
COPY . .

RUN deno cache main.ts

EXPOSE ${PORT}

CMD ["run", "--allow-net", "--allow-read", "--allow-sys", "--allow-write", "--allow-env", "main.ts"]

