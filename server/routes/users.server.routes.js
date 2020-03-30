import {
  me,
  update,
  changePassword,
  removeOAuthProvider,
  signup,
  signin,
  signout,
  userByID,
} from '../controllers/users.server.controller';

export default (app) => {
  app.route('/users/me').get(me);
  app.route('/users').put(update);
  app.route('/users/password').post(changePassword);
  app.route('/users/accounts').delete(removeOAuthProvider);

  app.route('/auth/signup').post(signup);
  app.route('/auth/signin').post(signin);
  app.route('/auth/signout').get(signout);

  app.param('userId', userByID);
};
