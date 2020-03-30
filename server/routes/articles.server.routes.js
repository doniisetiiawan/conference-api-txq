import { requiresLogin } from '../controllers/users.server.controller';
import {
  list as listzxg,
  create as createzxg,
  read as readzxg,
  hasAuthorization,
  update as updatezxg,
  deleteksj,
  articleByID as articleByIDzxg,
} from '../controllers/articles.server.controller';

export default (app) => {
  app
    .route('/articles')
    .get(listzxg)
    .post(requiresLogin, createzxg);

  app
    .route('/articles/:articleId')
    .get(readzxg)
    .put(
      requiresLogin,
      hasAuthorization,
      updatezxg,
    )
    .delete(
      requiresLogin,
      hasAuthorization,
      deleteksj,
    );

  app.param('articleId', articleByIDzxg);
};
