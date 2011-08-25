/* init gui */
jQuery(function($) {
  $(".ecpForm:not(.ecpInitedForm)").livequery(function() {
    var $this = $(this);

    // switch to fullscree
    $this.find(".ecpFullScreen").change(function() {
      var $fullScreen = $(this),
          $container = $fullScreen.parents(".simplemodal-container:first");

      if ($fullScreen.is(":checked")) {
        // TODO: save current geometry
        $container.data("geometry", {
          top: $container.css("top"),
          right: $container.css("right"),
          bottom: $container.css("bottom"),
          left: $container.css("left"),
          width: $container.css("width"),
          height: $container.css("height")
        });
        $container.css({
          top:0,
          right:0,
          bottom:0,
          left:0,
          width:'auto',
          height:'100%'
        });
        //$container.trigger("resize");
      } else {
        var geometry = $container.data("geometry");
        console.log("geomentry=",geometry);
        $container.css({
          top:geometry.top,
          right:geometry.right,
          bottom:geometry.bottom,
          left:geometry.left,
          width:geometry.width,
          height:geometry.height
        });
        $(window).trigger("resize");
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
