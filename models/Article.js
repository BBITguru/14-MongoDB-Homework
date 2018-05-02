var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  link: {
    type: String,
    required: true
  },
  notes: [String]
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;