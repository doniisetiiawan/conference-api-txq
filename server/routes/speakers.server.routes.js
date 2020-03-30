import { requiresLogin } from '../controllers/users.server.controller';
import {
  list as listnhk,
  create as createnhk,
  read as readnhk,
  hasAuthorization,
  update as updatenhk,
  deletecnj,
  speakerByID,
} from '../controllers/speakers.server.controller';

export default (app) => {
  app
    .route('/speakers')
    .get(listnhk)
    .post(requiresLogin, createnhk);

  app
    .route('/speakers/:speakerId')
    .get(readnhk)
    .put(
      requiresLogin,
      hasAuthorization,
      updatenhk,
    )
    .delete(
      requiresLogin,
      hasAuthorization,
      deletecnj,
    );

  app.param('speakerId', speakerByID);
};
