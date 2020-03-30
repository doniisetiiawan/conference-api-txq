function index(req, res) {
  res.send({
    user: req.user || null,
  });
}

export default index;
