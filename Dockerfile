FROM node:19
WORKDIR /app
ENV PORT 8000
COPY . .
RUN npm install
EXPOSE 8000
CMD [ "npm", "run", "dev"]