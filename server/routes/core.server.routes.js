import index from '../controllers/core.server.controller';

export default (app) => {
  app.route('/').get(index);
};
