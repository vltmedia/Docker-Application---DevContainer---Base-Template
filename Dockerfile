FROM alpine
RUN apk add --no-cache --update nodejs npm
WORKDIR /app
COPY package*.json ./
COPY . .
EXPOSE 5051
# ---------- dev ----------
FROM base AS dev
# keep alive for dev purposes
CMD ["tail", "-f", "/dev/null"]

# ---------- prod ----------
FROM base AS prod
# bring your app in only for the prod image
COPY . /app
RUN npm install --only=production
CMD ["npm", "start"]
