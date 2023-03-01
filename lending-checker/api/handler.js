import rootHandler from '../handle-request.js';

export default function handler(request, response) {
  console.time('serverless handler')
  rootHandler()
    .then(res => {
      response.status(200).json(res);
    })
    .catch(error => {
      response.status(500).json(error);
    }).finally(() => {
      console.timeEnd('serverless handler')
    });
}
