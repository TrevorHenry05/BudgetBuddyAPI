const handleError = (err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: "Something went wrong on the server.",
  });
};

module.exports = handleError;
