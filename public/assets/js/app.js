var buildArticleCard = (article) => {
    console.log("IN buildArticleCard");
    var card = $("<div>").addClass("row")
        .append($("<div>").addClass("col-9")
            .append(
                $("<div>").addClass("card savedArticleCard")
                .append(
                    $("<div>").addClass("card-header").append(
                        $("<a>").attr("href", article.link).attr("target", "_blank").append(
                            $("<h2>").text(article.title)
                        )
                    )
                )
                .append(
                    $("<div>").addClass("card-block").append(
                        $("<p>").text(article.description)
                    )
                )
            )
        )
        .append($("<div>").addClass("col-3")
            .append(
                $("<button>").addClass("btn btn-primary").attr("id", "btnArticleNotes").attr("data-id", article._id).text("Article Notes")
                .click(function () {
                    $.ajax("/getarticle/" + $(this).attr("data-id"), {
                            type: "GET"
                        })
                        .done(function (article) {
                            $("#noteBlock").empty();
                            $("#noteModal").attr("articleID", article._id);
                            $("#noteModalHeader").text("Notes for Article: " + article._id);
                            for (var i = 0; i < article.notes.length; i++) {
                                $("#noteBlock").append(buildNoteCard(article.notes[i], article._id));
                            }
                        })
                    $("#noteModal").modal();
                })
            )
            .append(
                $("<button>").addClass("btn btn-danger").attr("id", "btnDeleteArticle").attr("data-id", article._id).text("Delete From Saved")
                .click(function () {
                    console.log("Clicked Delete Article");
                    $.ajax("deleteArticle/" + $(this).attr("data-id"), {
                            type: "DELETE"
                        })
                        .done(function () {
                            console.log("Article Deletion Completed");
                        })
                    $(this).parent().parent().remove();
                })
            )
        );
    return card;
}

var buildNoteCard = (note, articleID) => {
    console.log("In build Note");
    console.log("   note: " + note);
    console.log("   ID: " + articleID);
    var noteCard = $("<div>").addClass("card noteCard")
        .append($("<div>").addClass("card-block").append($("<p>").text(note)))
        .append($("<button>").addClass("btn btn-danger").text("X")
            .click(function () {
                $.ajax({
                        url: "/deleteNote",
                        method: "DELETE",
                        data: {
                            note: $(this).parent().children(".card-block").children("p").text(),
                            articleID: articleID
                        }
                    })
                    .done(function () {});
                $(this).parent().remove();
            })
        )
    return noteCard;
}

$(function () {
    $(document).ready(function () {
        $.ajax("/getArticles", {
            type: "GET"
        }).then(function (results) {
            var articles = results.articles;
            console.log("App.articles in ReadyFunction:");
            console.log(articles);
            console.log();
            // $("#articleBlock").empty();
            if (articles.length > 0) {
                for (var i = 0; i < articles.length; i++) {
                    $("#articleBlock").append(buildArticleCard(articles[i]));
                }
            } else {
                var emptyCard = $("<div>").addClass("card empty-article").append(
                    $("<div>").addClass("card-header")
                    .append(
                        $("<h2>").text("Uh oh. Looks like we don't have any new articles.")
                    )
                );
                $("#articleBlock").append(emptyCard);
                // <div class="card text-center" style="">
                //     <div class="card-header">
                //         <h2 style="color:white;">Uh oh. Looks like we don't have any new articles.</h2>
                //     </div>
                // </div>
            }
        });
    });


    $("#scrape-btn").on("click", function () {
        console.log("Scrape button CLICKED");
        $.ajax("/scrape", {
            type: "GET"
        }).done(function (results) {
            console.log("Scrape COMPLETE");
            $("#articleBlock").empty();

            $("#scrapeModalHeader").text("Added " + results.articles.length + " new articles!");
            $("#scrapeModal").modal();

            var articles = results.articles;
            console.log("Articles " + articles);

            for (var i = 0; i < articles.length; i++) {
                console.log();
                console.log("Title: " + articles[i].title);
                console.log("Link: " + articles[i].link);
                console.log("Description: " + articles[i].description);
                var card = $("<div>").addClass("card newArticle").attr("data-id", i);
                var cardHeader = $("<div>").addClass("card-header");
                var link = $("<a>").attr("href", articles[i].link).attr("target", "_blank");
                var title = $("<h3>").text(articles[i].title);
                $(link).append(title);
                var saveButton = $("<button>").addClass("btn-success btnSaveArticle").attr("data-id", i).text("Save Article")
                    .click(function () {
                        var article = {};
                        article.title = $(this).parent().children("a").children("h3").text();
                        article.description = $(this).parent().parent().children(".card-block").children("p").text();
                        article.link = $(this).parent().children("a").attr("href");
                        // console.log("Article to Submit: ");
                        // console.log("   Title: " + article.title);
                        // console.log("   link: " + article.link);
                        // console.log("   description: " + article.description);
                        $.ajax({
                                method: "POST",
                                url: "/article",
                                data: article
                            })
                            .done(function () {
                                console.log("article saved");
                            })
                        $(this).parent().parent().remove();
                    });
                $(cardHeader).append(link).append(saveButton);
                var cardblock = $("<div>").addClass("card-block");
                var description = $("<p>").text(articles[i].description);
                $(cardblock).append(description);
                $(card).append(cardHeader).append(cardblock);
                $("#articleBlock").append(card);
            }
        });
    });

    $("#btnSaveNote").on("click", function () {
        if ($("#noteInput").html().length > 0) {
            console.log("Button - btnSaveNote");
            console.log("ArticleID: " + $("#noteModal").attr("articleID"));
            console.log("Note: " + $("#noteInput").val());
            $.ajax("/addNote", {
                method: "POST",
                data: {
                    articleID: $("#noteModal").attr("articleID"),
                    note: $("#noteInput").val()
                }
            }).done(function () {})
            $("#noteBlock").append(buildNoteCard($("#noteInput").val(), $("#noteModal").attr("articleID")))
            $("#noteInput").val('');
        } else {
            alert("Please enter something to be saved as a note.");
        }
    })
});