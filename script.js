
function setupCommentFavoriteScript (userHash) {
  var FAVCACHE = {};

  CommentFavorites.list(userHash).then(function (comments) {
    comments.forEach(function (c) {
      FAVCACHE[c.id] = true;
    });

    updateAfterFavCacheChanged();
  });

  jQuery("<style>").html("\
    .kfav-save { \
      display:block;  \
      color:#888; \
      cursor:pointer; \
      padding:2px 0; \
      font-weight:normal;\
    } \
    \
    .kfav-save:hover { \
      color:#bd3f27; \
    } \
    ").appendTo("body");

  var $favStyle = jQuery("<style>").appendTo("body");

  var link = jQuery("<a id='tab-kfav' class='head-tab' href='#favorisierte-kommentare'>k-fav</a>");
  jQuery("#filter-link").before(link);

  // integrate the k-fav link into the pr0gramm navigation code
  var link = jQuery("#tab-kfav");
  if (p._hasPushState) {
      link.each(function() {
          this.href = '/' + $(this).attr('href').substr(1);
      });
  }
  link.fastclick(p.mainView.handleHashLink.bind(p.mainView));

  var View = p.View.Base.extend({
    data: { comments: [] },
    template: '\
      <h1><h1 class="pane-head user-head"> Favorisierte Kommentare</a> </h1> \
      <div class="pane"> \
          <?js for(var i = 0; i < comments.length; i++) { var c = comments[i]; ?> \
             <div class="comment"> \
              <a href="#new/{c.item_id}:comment{c.id}"> <img src="{c.thumb}" class="comment-thumb"/> </a> \
              <div class="comment-content with-thumb"> {c.content.format()} </div> \
              <div class="comment-foot with-thumb"> <a href="#user/{c.name}" class="user um{c.mark}">{c.name}</a> \
                <?js if ( c.showScore ) {?> \
                  <span class="score" title="{c.up} up, {c.down} down">{"Punkt".inflect(c.score)}</span> \
                <?js } else { ?> \
                  <span class="score-hidden" title="Score noch unsichtbar">●●●</span> \
                <?js } ?> \
                <a href="#new/{c.item_id}:comment{c.id}" class="time permalink" title="{c.created.readableTime()}">{c.created.relativeTime(true)}</a> \
                <a data-comment-id="{c.id}" class="kfav-delete">entfernen</a> \
              </div> \
            </div> \
          <?js } ?> \
      </div>',

    init: function(container, parent) {
        this.parent(container, parent);
        p.mainView.setTab("kfav");

        var view = this;
        this.$container.on("click", ".kfav-delete", function () {
          var commentId = jQuery(this).data("comment-id");
          deleteCommentFavorite(commentId);

          view.data.comments = view.data.comments.filter(function (comment) {
            return comment.id !== commentId;
          });

          view.render();
        });
    },

    load: function() {
      CommentFavorites.list(userHash).then(this.loaded.bind(this));
      return false;
    },

    loaded: function(comments) {
      this.data.comments = comments;
      this.data.comments.forEach(function (c) {
        c.showScore = (parseInt(c.created) + CONFIG.COMMENT_SHOW_SCORE_AGE < Date.now() / 1000);
        c.created = new Date(c.created * 1000);
        c.thumb = c.thumb.match(/^\/\//) ? c.thumb : CONFIG.PATH.THUMBS + c.thumb;
        c.score = c.up - c.down;
      });

      this.render();
    }
  });

  // patch the Stream.Comments view.
  var NewCommentsClass = p.View.Stream.Comments.extend({
    render: function() {
      this.parent();
      enhanceComments(this.$container);
    }
  });

  NewCommentsClass.SortTime = p.View.Stream.Comments.SortTime;
  NewCommentsClass.SortConfidenceTime = p.View.Stream.Comments.SortConfidenceTime;
  p.View.Stream.Comments = NewCommentsClass;

  function enhanceComments($container) {
    $container.find(".comment-vote").append('<span class="pict kfav-save">*</span>');
  }

  if (jQuery(".kfav-save").length === 0) {
    // call once to setup already rendered comments
    enhanceComments(jQuery("body"));
  }

  // there is a race-condition somewhere. because of that, sometimes
  // the little hearts are not added. this is a workaround for that.
  window.setTimeout(function() {
    if (jQuery(".kfav-save").length === 0) {
      // call once to setup already rendered comments
      enhanceComments(jQuery("body"));
    }
  }, 1000);

  function updateAfterFavCacheChanged() {
    var selectors = [];
    for(var commentId in FAVCACHE) {
      if (FAVCACHE[commentId]) {
        selectors.push("#comment"+ commentId + " .kfav-save");
      }
    }

    var style = selectors.join(",") + "{ color: #ee4d2e; }"
    $favStyle.html(style);
  }

  function deleteCommentFavorite(commentId) {
    FAVCACHE[commentId] = false;
    updateAfterFavCacheChanged();

    return CommentFavorites.delete(userHash, commentId);
  }

  jQuery("body").on("click", ".kfav-save", function (event) {
    var commentId = parseInt(jQuery(this).closest(".comment").attr("id").substr(7));
    if (FAVCACHE[commentId]) {
      deleteCommentFavorite(commentId);
    } else {
      FAVCACHE[commentId] = true;
      updateAfterFavCacheChanged();

      var item = p.currentView.currentItemSubview.data.item;
      var comment = item.comments
        .filter(function (comment) { return comment.id === commentId; })
        .first();

      return CommentFavorites.put(userHash, item.id, {
        id: comment.id,
        created: comment.created,
        name: comment.name,
        content: comment.content,
        up: comment.up,
        down: comment.down,
        mark: comment.mark,
        thumb: item.thumb
      });
    };
  });

  p.addRoute(View, 'favorisierte-kommentare');
  var tmpRoute = p._routes[p._routes.length-2];
  p._routes[p._routes.length-2] = p._routes[p._routes.length-1];
  p._routes[p._routes.length-1] = tmpRoute;

  if (p.getURL() === "favorisierte-kommentare") {
    p.navigateTo("favorisierte-kommentare", p.NAVIGATE.FORCE);
  }
};

var CommentFavorites = {
  list: function(user_hash) {
    return jQuery.ajax({
        method: "GET",
        url: "//pr0.wibbly-wobbly.de/api/comments/v1/" + encodeURIComponent(user_hash)
    });
  },

  put: function(user_hash, item_id, comment) {
    var body = jQuery.extend({}, comment, {item_id: item_id});
    return jQuery.ajax({
      method: "POST",
      url: "//pr0.wibbly-wobbly.de/api/comments/v1/" + encodeURIComponent(user_hash),
      contentType: "application/json",
      data: JSON.stringify(body)
    });
  },

  delete: function(user_hash, comment_id) {
    return jQuery.ajax({
      method: "POST",
      url: "//pr0.wibbly-wobbly.de/api/comments/v1/" + encodeURIComponent(user_hash) + "/" + encodeURIComponent(comment_id) + "/delete"
    });
  }
};

jQuery(function() {
  p.api.get("user.info", {}, function(userInfo) {
    var userHash = md5(userInfo.account.email);
    setupCommentFavoriteScript(userHash);
  });
});
