module.exports = fn => {
  // Making a return anonymous function so that when an async function wrapped
  // with this method is ran, it will come here
  return (req, res, next) => {
    fn(req, res, next).catch(err => {
      next(err);
    });
  };
};
