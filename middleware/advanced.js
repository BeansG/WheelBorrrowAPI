const advancedResults = (model, populate) => async (req, res, next) => {
    let query;

    // Put the request query into a variable
    const reqQuery = { ...req.query };

    // Remove any keywords from our query
    const removeFields = ['select', 'sort', 'limit', 'page'];

    // Loop through fields and remove from query
    removeFields.forEach(param => delete reqQuery[param]);

    // Create a string from query
    let queryStr = JSON.stringify(reqQuery);

    // Create operators
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Searching for the resources
    query = model.find(JSON.parse(queryStr));

    // Select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort fields
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Limit and page fields
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // If the query contains populate, we want to add populate method on and pass in whatever was passed into populate
    if (populate) {
        query = query.populate(populate);
    }

    // Executing the query
    const results = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }
    // Want to send a response directly from here
    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }
    next();
};

module.exports = advancedResults;