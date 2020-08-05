const testEmailSending = async (req) => {
  return (req.query.email);
};

module.exports = { testEmailSending };