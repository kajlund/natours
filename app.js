const fs = require('fs');

const express = require('express');

const tours = require('./dev-data/data/tours-simple.json');

const app = express();

// Middleware
app.use(express.json());

app.get('/api/v1/tours', (req, res) => {
  res.status(200).send({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    './dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
