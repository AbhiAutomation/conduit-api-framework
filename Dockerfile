FROM cypress/included:15.17.0

WORKDIR /app

COPY . .

RUN npm install

ENTRYPOINT []

CMD ["npm" ,"run", "cy:run:all"]
