import axios from 'axios';
import {Request, Response} from 'express';

export const getMenu = async (req: Request, res: Response) => {
  axios.get('https://83.easysushi.fr/Commander.aspx/')
    .then((response: { data: string; }) => {
      const jsonRegex = /var json = (\[.*?]);/s;  // Regular expression to capture JSON value
      const match = response.data.match(jsonRegex);

      if (match && match[1]) {
        const jsonData = match[1];
        res.json(JSON.parse(jsonData));
      } else {
        console.error('json variable not found in the provided data.');
        res.status(500);
      }
    })
    .catch((error: any) => {
      console.error("Error fetching data: ", error);
      res.status(500);
    });
};

export const getLieux = async (req: Request, res: Response) => {
  axios.get('https://83.easysushi.fr/Commander.aspx/')
    .then((response: { data: string; }) => {
      const jsonRegex = /var lieux = (\[.*?]);/s;  // Regular expression to capture JSON value
      const match = response.data.match(jsonRegex);

      if (match && match[1]) {
        const jsonData = match[1];
        res.json(JSON.parse(jsonData));
      } else {
        console.error('json variable not found in the provided data.');
        res.status(500);
      }
    })
    .catch((error: any) => {
      console.error("Error fetching data: ", error);
      res.status(500);
    });
};

export const getHoraires = async (req: Request, res: Response) => {
  const id = req.query.id;
  const date = (req.query.date as string).replaceAll('/', '%2F');
  axios.get(`https://83.easysushi.fr/Creneaux.aspx?id=${id}&date=${date}`)
    .then((response: { data: string; }) => {
      if (response.data) {
        res.json(response.data);
      } else {
        console.error('json variable not found in the provided data.');
        res.status(500);
      }
    }).catch((error: any) => {
    console.error("Error fetching data: ", error);
  });
};

// ... Ajoutez d'autres méthodes selon vos besoins ...
