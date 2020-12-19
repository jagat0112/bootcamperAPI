const advancedResults = (model, populateData) => async (req, res, next) => {
  const reqQuery = { ...req.query };

  const removeFields = ["select", "sort", "page", "limit"];
  removeFields.forEach((params) => delete reqQuery[params]);

  let queryStr = JSON.stringify(reqQuery);

  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|eq|ne)\b/g,
    (match) => `$${match}`
  );

  let queryFinal = model.find(JSON.parse(queryStr));

  if (req.query.select) {
    const reqQ = req.query.select.split(",").join(" ");
    queryFinal = queryFinal.select(reqQ);
  }
  if (req.query.sort) {
    const reqQ = req.query.sort.split(",").join(" ");
    queryFinal = queryFinal.sort(reqQ);
  } else {
    queryFinal = queryFinal.sort("-createdAt");
  }

  const limit = parseInt(req.query.limit, 10) || 4;
  const page = parseInt(req.query.page, 10) || 1;
  const startingIndex = (page - 1) * limit;
  const endingIndex = page * limit;
  const total = await model.countDocuments();
  queryFinal = queryFinal.skip(startingIndex).limit(limit);

  let pagination = {};
  if (endingIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (page !== 1) {
    pagination.previous = {
      page: page - 1,
      limit,
    };
  }

  const results = await queryFinal.populate(populateData);

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
