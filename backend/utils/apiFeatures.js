// Small reusable query-builder for pagination / sorting / filtering.
// Mirrors the classic "APIFeatures" pattern used across Express/Mongoose APIs.
class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // Mongoose query
    this.queryString = queryString; // req.query
  }

  filter() {
    const excluded = ['page', 'sort', 'limit', 'fields', 'keyword'];
    const queryObj = { ...this.queryString };
    excluded.forEach((field) => delete queryObj[field]);

    // Support gte/gt/lte/lt operators e.g. price[gte]=100
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search(fields = []) {
    if (this.queryString.keyword) {
      const regex = new RegExp(this.queryString.keyword, 'i');
      const or = fields.map((f) => ({ [f]: regex }));
      this.query = this.query.find({ $or: or });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }
}

module.exports = APIFeatures;
