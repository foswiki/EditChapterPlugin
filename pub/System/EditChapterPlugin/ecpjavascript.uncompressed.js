/* init gui */
jQuery(function($) {

  function loadDialog(url, onsuccess) {
    $.ajax({
      url: url,
      dataType: 'html',
      async: false,
      success: function(data) {
        $("body").append(data);
        if (typeof(onsuccess) === 'function') {
          onsuccess.call(this, data);
        }
      }
    });
  }

  function saveGeometry($elem) {
    $elem.data("geometry", {
      top: $elem.css("top"),
      right: $elem.css("right"),
      bottom: $elem.css("bottom"),
      left: $elem.css("left"),
      width: $elem.css("width"),
      height: $elem.css("height")
    });
  }

  function restoreGeometry($elem) {
    var geometry = $elem.data("geometry");
    $elem.css({
      top:geometry.top,
      right:geometry.right,
      bottom:geometry.bottom,
      left:geometry.left,
      width:geometry.width,
      height:geometry.height
    });
  }

  $(".ecpEdit").live("click", function() {
    var $this = $(this),
        id = $this.parent().attr("id"),
        title = $this.parent().text(),
        opts = $.extend({id:id, title:title}, $this.metadata());

      function openEditDialog() {
        var editUrl = foswiki.getPreference("SCRIPTURL") +
          "/rest/RenderPlugin/template" +
          "?name=edit.chapter;expand=dialog" +
          ";topic="+opts.web+"."+opts.topic + 
          ";from="+opts.from + 
          ";to="+opts.to + 
          ";title="+opts.title +
          ";id="+id+
          ";t="+(new Date).getTime();

        loadDialog(editUrl, function(data) {
          foswiki.openDialog(data, {
            persist:false,
            containerCss: { 
              width:640
            },
            onCancel: function(dialog) {
              $.jsonRpc(foswiki.getPreference("SCRIPTURL")+"/jsonrpc", {
                namespace: "EditChapterPlugin",
                method: "unlock",
                params: {
                  "topic": opts.web+"."+opts.topic
                }
              });
            }
          }); 
        });
      }

      $.jsonRpc(foswiki.getPreference("SCRIPTURL")+"/jsonrpc", {
        namespace: 'EditChapterPlugin',
        method: 'lock',
        params: {
          "topic": opts.web+"."+opts.topic
        },
        success: openEditDialog,
        error: function(json, textStatus, xhr) {
          alert(json.error.message);
        }
      });


      return false;
  });

  // init edit form
  $(".ecpForm:not(.ecpInitedForm)").livequery(function() {
    var $this = $(this);

    // switch to fullscree
    $this.find(".ecpFullScreen").change(function() {
      var $fullScreen = $(this),
          $container = $fullScreen.parents(".simplemodal-container:first"),
          $textarea = $container.find("textarea");

      if ($fullScreen.is(":checked")) {
        saveGeometry($container);
        saveGeometry($textarea);
        $container.css({
          top:0,
          right:0,
          bottom:0,
          left:0,
          width:'auto',
          height:'100%'
        });
        $textarea.css({
          height:$container.height() - 180,
          width:'99%'
        });
        $container.find(".ui-resizable-handle").hide();
        $("body").children().not(".ecpDialog, .simplemodal-container").hide();
      } else {
        restoreGeometry($container);
        $textarea.css({
          height:'auto',
          width:'99%'
        });
        $container.find(".ui-resizable-handle").show();
        $("body").children().not(".ecpDialog, .simplemodal-container").show();
      }
    });

    // concat before submit
    $this.addClass("ecpInitedForm").submit(function() {
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

  // init foswikiToc
  $(".foswikiToc .ecpHeading").addClass("ecpDisabled");
  if ($.browser.msie) {
    // hoverIntent fails on IE...wtf
    $(".ecpHeading:not(.ecpDisabled)").hover(
      function(event) {
        $(this).addClass('ecpHover');
        event.stopPropagation();
      },
      function(event) {
        $(this).removeClass('ecpHover');
        event.stopPropagation();
      }
    );
  } else {
    $(".ecpHeading:not(.ecpDisabled)").hoverIntent({
      timeout: 500,
      over: function(event) {
        $(this).addClass('ecpHover');
        event.stopPropagation();
      },
      out: function(event) {
        $(this).removeClass('ecpHover');
        event.stopPropagation();
      }
    });
  }
});
