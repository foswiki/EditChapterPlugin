/* init gui */
jQuery(function($) {
  'use strict';

  // init edit link
  $(document).on("click", ".ecpEdit", function() {
    var $this = $(this), 
        href = $this.attr("href"),
        opts = $.extend({
          id: $this.parent().attr('id'),
          title: $this.attr('title')
        }, $this.data());

    // lock
    $.jsonRpc(foswiki.getScriptUrl("jsonrpc"), {
      namespace: 'EditChapterPlugin',
      method: 'lock',
      params: {
        "topic": opts.web+"."+opts.topic
      },
      success: function() {
        if (typeof(href) === 'undefined' || href == '#' || href == '') {
          href = foswiki.getScriptUrl("rest", "RenderPlugin", "template", {
            "name": "edit.chapter",
            "expand": "dialog",
            "topic": opts.web + "." + opts.topic,
            "from": opts.from,
            "to": opts.to,
            "title": opts.title,
            "id": opts.id,
            "t": (new Date()).getTime()
          });
        }
        $.get(href, function(content) { 
          var $content = $(content);
          $content.hide();
          $("body").append($content);
          $content.data("autoOpen", true);
        }); 
      },
      error: function(json, textStatus, xhr) {
        alert(json.error.message);
      }
    });

    return false;
  });

  // init edit form
  $(".ecpForm:not(.ecpInitedForm)").livequery(function() {
    var $this = $(this),
        topic = $this.find("input[name='topic']").val(),
        $dialog = $this.parent();

    $dialog.on("dialogclose", function(ev) {
      $.jsonRpc(foswiki.getScriptUrl("jsonrpc"), {
        namespace: "EditChapterPlugin",
        method: "unlock",
        params: {
          "topic": topic
        },
        error: function(json, textStatus, xhr) {
          //alert(json.error.message);
        }
      });
    });

    // focus textarea
    window.setTimeout(function() {
      $dialog.dialog({position: {my:'center', at:'center', of:window}});
    });

    // concat before submit
    $this.addClass("ecpInitedForm").submit(function() {
      // let editor kick in and do its thing before we snag the textarea's value
      $this.trigger("beforeSubmit"); 

      var before = $this.find('[name=beforetext]'),
          after = $this.find('[name=aftertext]'),
          chapter = $this.find('[name=chapter]'),
          text = $this.find("[name=text]"),
          chapterText, lastChar;

      //console.log("called ECP's beforeSubmitHandler");

      if (!before.length || !after.length || !chapter.length) {
        //console.log("before=", before.length, " after=", after.length, " chapter=",chapter.length);
        return false;
      }

      //console.log("merging text");

      chapterText = chapter.val();
      lastChar = chapterText.substr(chapterText.length-1, 1);
      if (lastChar != '\n') {
        chapterText += '\n';
      }
      text.val(before.val()+chapterText+after.val());
      //return false;
    });
  });

  // init 
  $(".ecpHeading:not(.ecpDisabled)").livequery(function() {
    var $this = $(this);

    $this.hoverIntent({
      timeout: 500,
      over: function(event) {
        $this.addClass('ecpHover');
      },
      out: function(event) {
        $this.removeClass('ecpHover');
      }
    });
  });
});
