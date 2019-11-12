/* init gui */
"use strict";
jQuery(function($) {

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
            "baseweb": opts.baseWeb,
            "basetopic": opts.baseTopic,
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
        $dialog = $this.parent(),
        insideSubmit = false;

    $dialog.on("dialogclose", function() {
      $.jsonRpc(foswiki.getScriptUrl("jsonrpc"), {
        namespace: "EditChapterPlugin",
        method: "unlock",
        params: {
          "topic": topic
        },
        error: function(json, textStatus, xhr) {
          console && console.error(json.error.message);
        }
      });

      $dialog.dialog("destroy").remove();
    });

    $dialog.on("dialogresize", function(ev, ui) {
      var editor = $this.find(".natedit").data("natedit");
      if (editor) {
        var editorContainer = editor.container,
            dialogContainer = $dialog,
            toolbar = $dialog.find(".ui-natedit-toolbar"),
            height = dialogContainer.height() - toolbar.height() - editorContainer.position().top; // SMELL: padding
        if (typeof(editor.setSize) === 'function') {
          editor.setSize(undefined, height);
        } else {
          $(editor.txtarea).height(height);
        }
      }
    });

    // concat before submit
    $this.addClass("ecpInitedForm").submit(function() {
      var editor;

      // prevent an endless loop
      if (insideSubmit) {
        insideSubmit = false;
        return;
      }

      // now prepare it
      insideSubmit = true;

      // handler to combine the full text again once the edit engine has finished its beforeSubmit handler
      function doit() {
        var before = $this.find('[name=beforetext]'),
            after = $this.find('[name=aftertext]'),
            chapter = $this.find('[name=chapter]'),
            text = $this.find("[name=text]"),
            chapterText, lastChar;

        if (!before.length || !after.length || !chapter.length) {
          return false;
        }

        chapterText = chapter.val();
        lastChar = chapterText.substr(chapterText.length-1, 1);
        if (lastChar != '\n') {
          chapterText += '\n';
        }
        text.val(before.val()+chapterText+after.val());

        $this.submit();
      }

      // let editor kick in and do its thing before we snag the textarea's value
      editor = $this.find(".natedit").data("natedit");
      if (typeof(editor) === 'undefined') {
        doit();
      } else {
        var dfd = editor.beforeSubmit();
        if (typeof(dfd) !== 'undefined') {
          dfd.then(doit);
        } else {
          doit();
        }
      }

      // the real submit happens inside doit() when beforeSubmit has finished
      return false;
    });

    // focus textarea
    window.setTimeout(function() {
      $dialog.dialog({position: {my:'center', at:'center', of:window}});
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
