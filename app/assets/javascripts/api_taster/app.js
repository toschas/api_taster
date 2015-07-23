var ApiTaster = {

  disableSubmitButton: function() {
    $("#submit-api").attr("disabled", true);
  },

  enableSubmitButton: function() {
    $("#submit-api").attr("disabled", false);
  },

  disableUrlParams: function() {
    $("fieldset[ref=url-params] input").prop("disabled", true);
  },

  enableUrlParams: function() {
    $("fieldset[ref=url-params] input").prop("disabled", false);
  },

  detectContentType: function(response) {
    var contentType = response.getResponseHeader("Content-Type");
    var detectedContentType = null;

    if (contentType.match(/application\/json/)) {
       detectedContentType = 'json';
    };

    return detectedContentType;
  },

  fillInInfoTab: function($tab, xhr) {
    $tab.find('.status td.value').text(xhr.status + " " + xhr.statusText);
    $tab.find('.headers td.value').text(xhr.getAllResponseHeaders());

    timeTaken = ApiTaster.lastRequest.endTime - ApiTaster.lastRequest.startTime
    $tab.find('.time td.value').text(timeTaken + " ms");
  },

  getSubmitUrl: function($form) {
    var baseUrl = $form.attr('action');
    var matches = baseUrl.match(/\:[^\/]+/g)

    if (matches) {
      for(var a = 0; a < matches.length; a++) {
        var match = matches[a];
        var str = match.substr(1);

        var $input = $form.find(
          'input[name="' + str + '"],input[name="[api_taster_url_params]' + str + '"]'
        );

        if ($input.length > 0) {
          baseUrl = baseUrl.replace(match, $input.val());
        }
      }
    }

    return baseUrl;
  },

  setHeaders: function(headers) {
    this.headers = headers;
  },

  headers: []

};

$.fn.extend({

  enableNavTabsFor: function(contentElement) {
    var $container = $(this);

    $container.find("ul.nav-tabs a").click(function() {
      $link = $(this);
      $li =  $link.parent();

      $li.addClass("active").siblings().removeClass("active");

      $container.find(contentElement).hide();
      $container.find(contentElement + "[ref=" + $link.attr("id") + "]").show();
      return false;
    });
  },

  showNavTab: function(name) {
    $response = $(this);
    $response.find("ul.nav-tabs li").removeClass("active");
    $response.find("ul.nav-tabs li a#response-" + name).parent().show().addClass("active");

    $response.find("pre").hide();

    return $response.find("pre[ref=response-" + name + "]").show();
  },

  displayOnlySelectedParamsFieldset: function() {
    $("fieldset", this).hide();
    $("fieldset[ref=" + $("ul.nav-tabs li.active a").attr("id") + "]", this).show();
  }

});

jQuery(function($) {
  $("#list-api-div a").click(function(e) {
    e.preventDefault();

    $(this).parent().siblings().removeClass("active");
    $(this).parent().addClass("active");

    $("#show-api-div .div-container").load(this.href, function() {
      prettyPrint();

      $("#show-api-div form").enableNavTabsFor("fieldset");
      $("#show-api-div form").displayOnlySelectedParamsFieldset();

      $("#show-api-div form").submit(onSubmit);
      $("#show-api-response-div").enableNavTabsFor("pre");
    });
  });

  $("#add-header").click(function(e) {
    e.preventDefault();

    var form = $("#xhr-headers").children().last().clone();
    splitId = $(form).children().last().attr('id').split('-');
    id = parseInt(splitId[splitId.length - 1]) + 1;

    $(form).children().last().attr("id", "delete-header-" + id);
    $("#xhr-headers").append($(form));
  });

  $("#xhr-headers").on('click', '.remove-header', function(e) {
    e.preventDefault();

    var children = $("#xhr-headers").children(".form-group").length;
    if (children > 1) {
      $(this).parent().remove();
    }
  });

  $("#xhr-headers").on('change', 'input[type=checkbox]', function(e) {
    e.preventDefault();

    var parent = $(this).parent()
    var header = parent.find(".header");
    var value = parent.find(".value");

    if(this.checked) {
      header.prop('disabled', false);
      value.prop('disabled', false);
    } else {
      header.prop('disabled', true);
      value.prop('disabled', true);
    }
  });


  function onSubmit(e) {
    $form = $(e.target);
    ApiTaster.disableSubmitButton();
    ApiTaster.disableUrlParams();

    window.ajax = $.ajax({
      beforeSend: function(xhr) {
        var headers = ApiTaster.headers;
        $.merge(headers, resolveCustomHeaders());

        for(var l = headers.length, i = 0; i < l; i ++) {
          xhr.setRequestHeader(headers[i].key, headers[i].value);
        }
      },
      url: ApiTaster.getSubmitUrl($form),
      type: $form.attr('method'),
      data: $form.serialize()
    }).complete(onComplete);

    ApiTaster.lastRequest = {};
    ApiTaster.lastRequest.startTime = Date.now();

    return false;
  }

  function resolveCustomHeaders() {
    var kids = $("#xhr-headers").children();
    var headers = [];

    for(var l = kids.length, i = 0; i < l; i++) {
      var kid = $(kids[i]);

      var checkb = kid.find(".check-header");

      if ($(checkb).is(":checked")) {

        var header = kid.find(".header").val();
        var value = kid.find(".value").val();

        headers.push({ key: header, value: value });

      }
    }

    return headers;
  }


  function onComplete(xhr, status) {
    ApiTaster.lastRequest.endTime = Date.now();
    ApiTaster.enableSubmitButton();
    ApiTaster.enableUrlParams();

    if ($("#show-api-response-div:visible").length == 0) {
      $("#show-api-response-div").slideDown(100);
    }

    ApiTaster.fillInInfoTab(
      $("#show-api-response-div").showNavTab("info"),
      xhr
    );

    switch (ApiTaster.detectContentType(xhr)) {
      case "json":
        $("#show-api-response-div").showNavTab("json").text(
          JSON.stringify(JSON.parse(xhr.responseText), null, 2)
        );
        break;
    }

    $("#show-api-response-div pre[ref=response-raw]").text(xhr.responseText);
    ApiTaster.headers = [];

    prettyPrint();
  }

});
