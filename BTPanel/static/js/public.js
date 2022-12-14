$(function () {
  $.fn.extend({
    fixedThead: function (options) {
      var _that = $(this);
      var option = {
        height: 400,
        shadow: true,
        resize: true
      };
      options = $.extend(option, options);
      if ($(this).find('table').length === 0) {
        return false;
      }
      var _height = $(this)[0].style.height, _table_config = _height.match(/([0-9]+)([%\w]+)/);
      if (_table_config === null) {
        _table_config = [null, options.height, 'px'];
      } else {
        $(this).css({
          'boxSizing': 'content-box',
          'paddingBottom': $(this).find('thead').height()
        });
      }
      $(this).css({ 'position': 'relative' });
      var _thead = $(this).find('thead')[0].outerHTML,
        _tbody = $(this).find('tbody')[0].outerHTML,
        _thead_div = $('<div class="thead_div"><table class="table table-hover mb0"></table></div>'),
        _shadow_top = $('<div class="tbody_shadow_top"></div>'),
        _tbody_div = $('<div class="tbody_div" style="height:' + _table_config[1] + _table_config[2] + ';"><table class="table table-hover mb0" style="margin-top:-' + $(this).find('thead').height() + 'px"></table></div>'),
        _shadow_bottom = $('<div class="tbody_shadow_bottom"></div>');
      _thead_div.find('table').append(_thead);
      _tbody_div.find('table').append(_thead);
      _tbody_div.find('table').append(_tbody);
      $(this).html('');
      $(this).append(_thead_div);
      $(this).append(_shadow_top);
      $(this).append(_tbody_div);
      $(this).append(_shadow_bottom);
      var _table_width = _that.find('.thead_div table')[0].offsetWidth,
        _body_width = _that.find('.tbody_div table')[0].offsetWidth,
        _length = _that.find('tbody tr:eq(0)>td').length;
      $(this).find('tbody tr:eq(0)>td').each(function (index, item) {
        var _item = _that.find('thead tr:eq(0)>th').eq(index);
        if (index === (_length - 1)) {
          _item.attr('width', $(item)[0].clientWidth + (_table_width - _body_width));
        } else {
          _item.attr('width', $(item)[0].offsetWidth);
        }
      });
      if (options.resize) {
        $(window).resize(function () {
          var _table_width = _that.find('.thead_div table')[0].offsetWidth,
            _body_width = _that.find('.tbody_div table')[0].offsetWidth,
            _length = _that.find('tbody tr:eq(0)>td').length;
          _that.find('tbody tr:eq(0)>td').each(function (index, item) {
            var _item = _that.find('thead tr:eq(0)>th').eq(index);
            if (index === (_length - 1)) {
              _item.attr('width', $(item)[0].clientWidth + (_table_width - _body_width));
            } else {
              _item.attr('width', $(item)[0].offsetWidth);
            }
          });
        });
      }
      if (options.shadow) {
        var table_body = $(this).find('.tbody_div')[0];
        if (_table_config[1] >= table_body.scrollHeight) {
          $(this).find('.tbody_shadow_top').hide();
          $(this).find('.tbody_shadow_bottom').hide();
        } else {
          $(this).find('.tbody_shadow_top').hide();
          $(this).find('.tbody_shadow_bottom').show();
        }
        $(this).find('.tbody_div').scroll(function (e) {
          var _scrollTop = $(this)[0].scrollTop,
            _scrollHeight = $(this)[0].scrollHeight,
            _clientHeight = $(this)[0].clientHeight,
            _shadow_top = _that.find('.tbody_shadow_top'),
            _shadow_bottom = _that.find('.tbody_shadow_bottom');
          if (_scrollTop == 0) {
            _shadow_top.hide();
            _shadow_bottom.show();
          } else if (_scrollTop > 0 && _scrollTop < (_scrollHeight - _clientHeight)) {
            _shadow_top.show();
            _shadow_bottom.show();
          } else if (_scrollTop == (_scrollHeight - _clientHeight)) {
            _shadow_top.show();
            _shadow_bottom.hide();
          }
        })
      }
    }

  });

}(jQuery))

$(document).ready(function () {
  $(".sub-menu a.sub-menu-a").click(function () {
    $(this).next(".sub").slideToggle("slow").siblings(".sub:visible").slideUp("slow");
  });
});
var aceEditor = {
  layer_view: '',
  aceConfig: {},  //ace????????????
  editor: null,
  pathAarry: [],
  editorLength: 0,
  isAceView: true,
  ace_active: '',
  is_resizing: false,
  menu_path: '', //???????????????????????????
  refresh_config: {
    el: {}, // ???????????????????????????,???DOM??????
    path: '',// ?????????????????????????????????
    group: 1,// ???????????????????????????css????????????
    is_empty: true
  }, //??????????????????
  // ???????????????-?????????????????????
  eventEditor: function () {
    var _this = this, _icon = '<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>';
    $(window).resize(function () {
      if (_this.ace_active != undefined) _this.setEditorView()
      if ($('.aceEditors .layui-layer-maxmin').length > 0) {
        $('.aceEditors').css({
          'top': 0,
          'left': 0,
          'width': $(this)[0].innerWidth,
          'height': $(this)[0].innerHeight
        });
      }
    })
    $(document).click(function (e) {
      $('.ace_toolbar_menu').hide();
      $('.ace_conter_editor .ace_editors').css('fontSize', _this.aceConfig.aceEditor.fontSize + 'px');
      $('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
    });
    $('.ace_editor_main').on('click', function () {
      $('.ace_toolbar_menu').hide();
    });
    $('.ace_toolbar_menu').click(function (e) {
      e.stopPropagation();
      e.preventDefault();
    });
    // ???????????????
    $('.ace_header .pull-down').click(function () {
      if ($(this).find('i').hasClass('glyphicon-menu-down')) {
        $('.ace_header').css({ 'top': '-30px' });
        $('.ace_overall').css({ 'top': '0' });
        $(this).css({ 'top': '30px', 'height': '30px', 'line-height': '30px' });
        $(this).find('i').addClass('glyphicon-menu-up').removeClass('glyphicon-menu-down');
      } else {
        $('.ace_header').css({ 'top': '0' });
        $('.ace_overall').css({ 'top': '30px' });
        $(this).removeAttr('style');
        $(this).find('i').addClass('glyphicon-menu-down').removeClass('glyphicon-menu-up');
      }
      _this.setEditorView();
    });
    // ??????TAB??????
    $('.ace_conter_menu').on('click', '.item', function (e) {
      var _id = $(this).attr('data-id'), _item = _this.editor[_id]
      $('.item_tab_' + _id).addClass('active').siblings().removeClass('active');
      $('#ace_editor_' + _id).addClass('active').siblings().removeClass('active');
      _this.ace_active = _id;
      _this.currentStatusBar(_id);
      _this.is_file_history(_item);
    });
    // ??????TAB????????????????????????????????????
    $('.ace_conter_menu').on('mouseover', '.item .icon-tool', function () {
      var type = $(this).attr('data-file-state');
      if (type != '0') {
        $(this).removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
      }
    });
    // ??????tab????????????????????????????????????
    $('.ace_conter_menu').on('mouseout', '.item .icon-tool', function () {
      var type = $(this).attr('data-file-state');
      if (type != '0') {
        $(this).removeClass('glyphicon-remove').addClass('glyphicon-exclamation-sign');
      }
    });
    // ??????????????????
    $('.ace_conter_menu').on('click', '.item .icon-tool', function (e) {
      var file_type = $(this).attr('data-file-state');
      var file_title = $(this).attr('data-title');
      var _id = $(this).parent().parent().attr('data-id');
      switch (file_type) {
        // ????????????
        case '0':
          _this.removeEditor(_id);
          break;
        // ?????????
        case '1':
          var loadT = layer.open({
            type: 1,
            area: ['400px', '180px'],
            title: '??????',
            content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">???????????????&nbsp<span class="size_ellipsis" style="max-width:150px;vertical-align: top;" title="' + file_title + '">' + file_title + '</span>&nbsp????????????</div>\
							<div class="clear-tips">????????????????????????????????????</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default" style="float:left" data-type="2">???????????????</button>\
								<button type="button" class="btn btn-sm btn-default" style="margin-right:10px;" data-type="1">??????</button>\
								<button type="button" class="btn btn-sm btn-success" data-type="0">????????????</button>\
							</div>\
						</div>',
            success: function (layers, index) {
              $('.ace-clear-btn .btn').click(function () {
                var _type = $(this).attr('data-type'),
                  _item = _this.editor[_id];
                switch (_type) {
                  case '0': //????????????
                    _this.saveFileMethod(_item);
                    break;
                  case '1': //????????????
                    layer.close(index);
                    break;
                  case '2': //????????????
                    _this.removeEditor(_id);
                    layer.close(index);
                    break;
                }
              });
            }
          });
          break;
      }
      $('.ace_toolbar_menu').hide();
      $('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
      e.stopPropagation();
      e.preventDefault();
    });
    $(window).keyup(function (e) {
      if (e.keyCode === 116 && $('#ace_conter').length == 1) {
        layer.msg('?????????????????????????????????????????????????????????');
      }
    });
    // ?????????????????????
    $('.ace_editor_add').click(function () {
      _this.addEditorView();
    });
    // ???????????????????????????
    $('.ace_conter_toolbar .pull-right span').click(function (e) {
      var _type = $(this).attr('data-type'),
        _item = _this.editor[_this.ace_active];
      $('.ace_toolbar_menu').show();
      switch (_type) {
        case 'cursor':
          $('.ace_toolbar_menu').hide();
          $('.ace_header .jumpLine').click();
          break;

        case 'history':
          $('.ace_toolbar_menu').hide();
          if (_item.historys.length === 0) {
            layer.msg('??????????????????', { icon: 0 });
            return false;
          }
          _this.layer_view = layer.open({
            type: 1,
            area: '550px',
            title: '??????????????????[ ' + _item.fileName + ' ]',
            skin: 'historys_layer',
            content: '<div class="pd20">\
							<div class="divtable" style="overflow:auto;height:450px;">\
								<table class="historys table table-hover">\
									<thead><tr><th>????????????</th><th style="text-align:right;">??????</th></tr></thead>\
									<tbody></tbody>\
								</table>\
							</div>\
						</div>',
            success: function (layeo, index) {
              var _html = '';
              for (var i = 0; i < _item.historys.length; i++) {
                _html += '<tr><td>' + bt.format_data(_item.historys[i]) + '</td><td align="right"><a href="javascript:;" class="btlink open_history_file" data-time="' + _item.historys[i] + '">????????????</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="javascript:;" class="btlink recovery_file_historys" data-history="' + _item.historys[i] + '" data-path="' + _item.path + '">??????</a></td></tr>'
              }
              if (_html === '') _html += '<tr><td colspan="3">???????????????????????????</td></tr>'
              $('.historys tbody').html(_html);
              $('.historys_layer').css('top', ($(window).height() / 2) - ($('.historys_layer').height() / 2) + 'px')
              $('.open_history_file').click(function () {
                var _history = $(this).attr('data-time');
                _this.openHistoryEditorView({ filename: _item.path, history: _history }, function () {
                  layer.close(index);
                  $('.ace_conter_tips').show();
                  $('.ace_conter_tips .tips').html('????????????????????????' + _item.path + '??????????????? [ ' + bt.format_data(new Number(_history)) + ' ]<a href="javascript:;" class="ml35 btlink" data-path="' + _item.path + '" data-history="' + _history + '">??????????????????????????????</a>');
                });
              });
              $('.recovery_file_historys').click(function () {
                _this.event_ecovery_file(this);
              });
            }
          });
          break;
        case 'tab':
          $('.ace_toolbar_menu .menu-tabs').show().siblings().hide();
          $('.tabsType').find(_item.softTabs ? '[data-value="nbsp"]' : '[data-value="tabs"]').addClass('active').append(_icon);
          $('.tabsSize [data-value="' + _item.tabSize + '"]').addClass('active').append(_icon);
          break;
        case 'encoding':
          _this.getEncodingList(_item.encoding);
          $('.ace_toolbar_menu .menu-encoding').show().siblings().hide();
          break;
        case 'readOnly':
          $('.ace_toolbar_menu').hide();
          layer.msg('????????????????????????????????????????????????', { icon: 6 });
          break;
        case 'lang':
          $('.ace_toolbar_menu').hide();
          layer.msg('?????????????????????????????????????????????!', { icon: 6 });
          break;
      }
      e.stopPropagation();
      e.preventDefault();
    });
    // ????????????
    $('.tips_fold_icon .glyphicon').click(function () {
      if ($(this).hasClass('glyphicon-menu-left')) {
        $('.ace_conter_tips').css('right', '0');
        $('.tips_fold_icon').css('left', '0');
        $(this).removeClass('glyphicon-menu-left').addClass('glyphicon-menu-right');
      } else {
        $('.ace_conter_tips').css('right', '-100%');
        $('.tips_fold_icon').css('left', '-25px');
        $(this).removeClass('glyphicon-menu-right').addClass('glyphicon-menu-left');
      }
    });
    // ???????????????
    $('.menu-tabs').on('click', 'li', function (e) {
      var _val = $(this).attr('data-value'), _item = _this.editor[_this.ace_active];
      if ($(this).parent().hasClass('tabsType')) {
        _item.ace.getSession().setUseSoftTabs(_val == 'nbsp');
        _item.softTabs = _val == 'nbsp';
      } else {
        _item.ace.getSession().setTabSize(_val);
        _item.tabSize = _val;
      }
      $(this).siblings().removeClass('active').find('.icon').remove();
      $(this).addClass('active').append(_icon);
      _this.currentStatusBar(_item.id);
      e.stopPropagation();
      e.preventDefault();
    });
    // ??????????????????
    $('.menu-encoding').on('click', 'li', function (e) {
      var _item = _this.editor[_this.ace_active];
      layer.msg('?????????????????????' + $(this).attr('data-value'));
      $('.ace_conter_toolbar [data-type="encoding"]').html('?????????<i>' + $(this).attr('data-value') + '</i>');
      $(this).addClass('active').append(_icon).siblings().removeClass('active').find('span').remove();
      _item.encoding = $(this).attr('data-value');
      _this.saveFileMethod(_item);
    });
    // ????????????????????????
    $('.menu-files .menu-input').keyup(function () {
      _this.searchRelevance($(this).val());
      if ($(this).val != '') {
        $(this).next().show();
      } else {
        $(this).next().hide();
      }
    });
    // ????????????????????????
    $('.menu-files .menu-conter .fa').click(function () {
      $('.menu-files .menu-input').val('').next().hide();
      _this.searchRelevance();
    });
    // ???????????????
    $('.ace_header>span').click(function (e) {
      var type = $(this).attr('class'), _item = _this.editor[_this.ace_active];
      if (_this.ace_active == '' && type != 'helps') {
        return false;
      }
      switch (type) {
        case 'saveFile': //??????????????????
          _this.saveFileMethod(_item);
          break;
        case 'saveFileAll': //????????????
          var loadT = layer.open({
            type: 1,
            area: ['350px', '180px'],
            title: '??????',
            content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">???????????????????????????????????????</div>\
							<div class="clear-tips">????????????????????????????????????</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default clear-btn" style="margin-right:10px;" >??????</button>\
								<button type="button" class="btn btn-sm btn-success save-all-btn">????????????</button>\
							</div>\
						</div>',
            success: function (layers, index) {
              $('.clear-btn').click(function () {
                layer.close(index);
              });
              $('.save-all-btn').click(function () {
                var _arry = [], editor = aceEditor['editor'];
                for (var item in editor) {
                  _arry.push({
                    path: editor[item]['path'],
                    data: editor[item]['ace'].getValue(),
                    encoding: editor[item]['encoding'],
                  })
                }
                _this.saveAllFileBody(_arry, function () {
                  $('.ace_conter_menu>.item').each(function (el, index) {
                    var _id = $(this).attr('data-id');
                    $(this).find('i').attr('data-file-state', '0').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
                    aceEditor['editor'][_id].fileType = 0;
                  });
                  layer.close(index);
                });
              });
            }
          });
          break;
        case 'refreshs': //????????????
          if (_item.fileType === 0) {
            aceEditor.getFileBody({ path: _item.path }, function (res) {
              _item.ace.setValue(res.data);
              _item.fileType = 0;
              $('.item_tab_' + _item.id + ' .icon-tool').attr('data-file-state', '0').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
              layer.msg('????????????', { icon: 1 });
            });
            return false;
          }
          var loadT = layer.open({
            type: 1,
            area: ['350px', '180px'],
            title: '??????',
            content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">????????????????????????</div>\
							<div class="clear-tips">???????????????????????????????????????,???????????????</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default clear-btn" style="margin-right:10px;" >??????</button>\
								<button type="button" class="btn btn-sm btn-success save-all-btn">??????</button>\
							</div>\
						</div>',
            success: function (layers, index) {
              $('.clear-btn').click(function () {
                layer.close(index);
              });
              $('.save-all-btn').click(function () {
                aceEditor.getFileBody({ path: _item.path }, function (res) {
                  layer.close(index);
                  _item.ace.setValue(res.data);
                  _item.fileType == 0;
                  $('.item_tab_' + _item.id + ' .icon-tool').attr('data-file-state', '0').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
                  layer.msg('????????????', { icon: 1 });
                });
              });
            }
          });
          break;
        // ??????
        case 'searchs':
          _item.ace.execCommand('find');
          break;
        // ??????
        case 'replaces':
          _item.ace.execCommand('replace');
          break;
        // ?????????
        case 'jumpLine':
          $('.ace_toolbar_menu').show().find('.menu-jumpLine').show().siblings().hide();
          $('.set_jump_line input').val('').focus();
          var _cursor = aceEditor.editor[aceEditor.ace_active].ace.selection.getCursor();
          $('.set_jump_line .jump_tips span:eq(0)').text(_cursor.row);
          $('.set_jump_line .jump_tips span:eq(1)').text(_cursor.column);
          $('.set_jump_line .jump_tips span:eq(2)').text(aceEditor.editor[aceEditor.ace_active].ace.session.getLength());
          $('.set_jump_line input').unbind('keyup').on('keyup', function (e) {
            var _val = $(this).val();
            if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
              if (_val != '' && typeof parseInt(_val) == 'number') {
                _item.ace.gotoLine(_val);
              };
            }
          });
          break;
        // ??????
        case 'fontSize':
          $('.ace_toolbar_menu').show().find('.menu-fontSize').show().siblings().hide();
          $('.menu-fontSize .set_font_size input').val(_this.aceConfig.aceEditor.fontSize).focus();
          $('.menu-fontSize set_font_size input').unbind('keypress onkeydown').on('keypress onkeydown', function (e) {
            var _val = $(this).val();
            if (_val == '') {
              $(this).css('border', '1px solid red');
              $(this).next('.tips').text('?????????????????? 12-45');
            } else if (!isNaN(_val)) {
              $(this).removeAttr('style');
              if (parseInt(_val) > 11 && parseInt(_val) < 45) {
                $('.ace_conter_editor .ace_editors').css('fontSize', _val + 'px')
              } else {
                $('.ace_conter_editor .ace_editors').css('fontSize', '13px');
                $(this).css('border', '1px solid red');
                $(this).next('.tips').text('?????????????????? 12-45');
              }
            } else {
              $(this).css('border', '1px solid red');
              $(this).next('.tips').text('?????????????????? 12-45');
            }
            e.stopPropagation();
            e.preventDefault();
          });
          $('.menu-fontSize .menu-conter .set_font_size input').unbind('change').change(function () {
            var _val = $(this).val();
            $('.ace_conter_editor .ace_editors').css('fontSize', _val + 'px');
          });
          $('.set_font_size .btn-save').unbind('click').click(function () {
            var _fontSize = $('.set_font_size input').val();
            _this.aceConfig.aceEditor.fontSize = parseInt(_fontSize);
            _this.saveAceConfig(_this.aceConfig, function (res) {
              if (res.status) {
                $('.ace_editors').css('fontSize', _fontSize + 'px');
                layer.msg('????????????', { icon: 1 });
              }
            });
          });
          break;
        //??????
        case 'themes':
          $('.ace_toolbar_menu').show().find('.menu-themes').show().siblings().hide();
          var _html = '', _arry = ['????????????', '????????????'];
          for (var i = 0; i < _this.aceConfig.themeList.length; i++) {
            if (_this.aceConfig.themeList[i] != _this.aceConfig.aceEditor.editorTheme) {
              _html += '<li data-value="' + _this.aceConfig.themeList[i] + '">' + _this.aceConfig.themeList[i] + '???' + _arry[i] + '???</li>';
            } else {
              _html += '<li data-value="' + _this.aceConfig.themeList[i] + '" class="active">' + _this.aceConfig.themeList[i] + '???' + _arry[i] + '???' + _icon + '</li>';
            }
          }
          $('.menu-themes ul').html(_html);
          $('.menu-themes ul li').click(function () {
            var _theme = $(this).attr('data-value');
            $(this).addClass('active').append(_icon).siblings().removeClass('active').find('.icon').remove();
            _this.aceConfig.aceEditor.editorTheme = _theme;
            _this.saveAceConfig(_this.aceConfig, function (res) {
              for (var item in _this.editor) {
                _this.editor[item].ace.setTheme("ace/theme/" + _theme);
              }
              layer.msg('????????????', { icon: 1 });
            });
          });
          break;
        case 'setUp':
          $('.ace_toolbar_menu').show().find('.menu-setUp').show().siblings().hide();
          $('.menu-setUp .editor_menu li').each(function (index, el) {
            var _type = _this.aceConfig.aceEditor[$(el).attr('data-type')];
            if (_type) $(el).addClass('active').append(_icon);
          })
          $('.menu-setUp .editor_menu li').unbind('click').click(function () {
            var _type = $(this).attr('data-type');
            _this.aceConfig.aceEditor[_type] = !$(this).hasClass('active');
            if ($(this).hasClass('active')) {
              $(this).removeClass('active').find('.icon').remove();
            } else {
              $(this).addClass('active').append(_icon);
            }
            _this.saveAceConfig(_this.aceConfig, function (res) {
              for (var item in _this.editor) {
                _this.editor[item].ace.setOption(_type, _this.aceConfig.aceEditor[_type]);
              }
              layer.msg('????????????', { icon: 1 });
            });
          });
          break;
        case 'helps':
          if (!$('[data-type=shortcutKeys]').length != 0) {
            _this.addEditorView(1, { title: '???????????????', html: aceShortcutKeys.innerHTML });
          } else {
            $('[data-type=shortcutKeys]').click();
          }
          break;
      }

      e.stopPropagation();
      e.preventDefault();
    });

    // ??????????????????
    $('.ace_catalogue_list').on('click', '.has-children .file_fold', function (e) {
      var _layers = $(this).attr('data-layer'), _type = $(this).find('data-type'), _path = $(this).parent().attr('data-menu-path'), _menu = $(this).find('.glyphicon'), _group = parseInt($(this).attr('data-group')), _file = $(this).attr('data-file'), _tath = $(this);
      var _active = $('.ace_catalogue_list .has-children .file_fold.edit_file_group');
      if (_active.length > 0 && $(this).attr('data-edit') === undefined) {
        switch (_active.attr('data-edit')) {
          case '2':
            _active.find('.file_input').siblings().show();
            _active.find('.file_input').remove();
            _active.removeClass('edit_file_group').removeAttr('data-edit');
            break;
          case '1':
          case '0':
            _active.parent().remove();
            break;
        }
        layer.closeAll('tips');
      }
      $('.ace_toolbar_menu').hide();
      $('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
      if ($(this).hasClass('edit_file_group')) return false;
      $('.ace_catalogue_list .has-children .file_fold').removeClass('bg');
      $(this).addClass('bg');
      if ($(this).attr('data-file') == 'Dir') {
        if (_menu.hasClass('glyphicon-menu-right')) {
          _menu.removeClass('glyphicon-menu-right').addClass('glyphicon-menu-down');
          $(this).next().show();
          if ($(this).next().find('li').length == 0) _this.reader_file_dir_menu({ el: $(this).next(), path: _path, group: _group + 1 });
        } else {
          _menu.removeClass('glyphicon-menu-down').addClass('glyphicon-menu-right');
          $(this).next().hide();
        }
      } else {
        _this.openEditorView(_path, function (res) {
          if (res.status) _tath.addClass('active');
        });
      }
      e.stopPropagation();
      e.preventDefault();
    });

    // ????????????????????????????????????
    $('.ace_catalogue').bind("selectstart", function (e) {
      var omitformtags = ["input", "textarea"];
      omitformtags = "|" + omitformtags.join("|") + "|";
      if (omitformtags.indexOf("|" + e.target.tagName.toLowerCase() + "|") == -1) {
        return false;
      } else {
        return true;
      }
    });
    // ???????????????????????????????????????
    $('.ace_dir_tools').on('click', '.upper_level', function () {
      var _paths = $(this).attr('data-menu-path');
      _this.reader_file_dir_menu({ path: _paths, is_empty: true });
      $('.ace_catalogue_title').html('?????????' + _paths).attr('title', _paths);
    });
    // ???????????????????????????????????????
    $('.ace_dir_tools').on('click', '.new_folder', function (e) {
      var _paths = $(this).parent().find('.upper_level').attr('data-menu-path');
      $(this).find('.folder_down_up').show();
      $(document).click(function () {
        $('.folder_down_up').hide();
        $(this).unbind('click');
        return false;
      });
      $('.ace_toolbar_menu').hide();
      $('.ace_catalogue_menu').hide();
      $('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
      e.stopPropagation();
      e.preventDefault();
    });
    // ???????????? (?????????????????????)
    $('.ace_dir_tools').on('click', '.refresh_dir', function (e) {
      _this.refresh_config = {
        el: $('.cd-accordion-menu')[0],
        path: $('.ace_catalogue_title').attr('title'),
        group: 1,
        is_empty: true
      }
      _this.reader_file_dir_menu(_this.refresh_config, function () {
        layer.msg('????????????', { icon: 1 });
      });
    });
    // ???????????? (?????????????????????)
    $('.ace_dir_tools').on('click', '.search_file', function (e) {
      if ($(this).parent().find('.search_input_view').length == 0) {
        $(this).siblings('div').hide();
        $(this).css('color', '#ec4545').attr({ 'title': '??????' }).find('.glyphicon').removeClass('glyphicon-search').addClass('glyphicon-remove').next().text("??????");
        $(this).before('<div class="search_input_title">??????????????????</div>');
        $(this).after('<div class="search_input_view">\
					<form>\
                        <input type="text" id="search_input_val" class="ser-text pull-left" placeholder="">\
                        <button type="button" class="ser-sub pull-left"></button>\
                    </form>\
                    <div class="search_boxs">\
                        <input id="search_alls" type="checkbox">\
                        <label for="search_alls"><span>?????????????????????</span></label>\
                    </div>\
                </div>');
        $('.ace_catalogue_list').css('top', '150px');
        $('.ace_dir_tools').css('height', '110px');
        $('.cd-accordion-menu').empty();
      } else {
        $(this).siblings('div').show();
        $(this).parent().find('.search_input_view,.search_input_title').remove();
        $(this).removeAttr('style').attr({ 'title': '????????????' }).find('.glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-search').next().text("??????");
        $('.ace_catalogue_list').removeAttr('style');
        $('.ace_dir_tools').removeAttr('style');
        _this.refresh_config = {
          el: $('.cd-accordion-menu')[0],
          path: $('.ace_catalogue_title').attr('title'),
          group: 1,
          is_empty: true
        }
        _this.reader_file_dir_menu(_this.refresh_config);
      }
    });

    // ??????????????????
    $('.ace_dir_tools').on('click', '.search_input_view button', function (e) {
      var path = _this.menu_path,
        search = $('#search_input_val').val();
      _this.reader_file_dir_menu({
        el: $('.cd-accordion-menu')[0],
        path: path,
        group: 1,
        search: search,
        all: $('#search_alls').is(':checked') ? 'True' : 'False',
        is_empty: true
      })
    });

    // ?????????????????????????????????????????????
    $('.ace_dir_tools').on('click', '.folder_down_up li', function (e) {
      var _type = parseInt($(this).attr('data-type')), element = $('.cd-accordion-menu'), group = 0, type = 'Dir';
      if ($('.file_fold.bg').length > 0 && $('.file_fold.bg').data('file') !== 'files') {
        element = $('.file_fold.bg');
        group = parseInt(element.data('group'));
        type = element.data('file');
        if (type === 'Files' && group !== 0) {
          if (group === 1) {
            element = element.parent().parent()
          } else {
            element = element.parent().parent().prev()
          }
          group = group - 1;
        }
      }
      // console.log(element)
      switch (_type) {
        case 2:
          _this.newly_file_type_dom(element, group, 0);
          break;
        case 3:
          _this.newly_file_type_dom(element, group, 1);
          break;
      }
      _this.refresh_config = {
        el: $('.cd-accordion-menu')[0],
        path: $('.ace_catalogue_title').attr('title'),
        group: 1,
        is_empty: true
      }
      $(this).parent().hide();
      $('.ace_toolbar_menu').hide();
      $('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
      e.preventDefault();
      e.stopPropagation();
    });
    // ???????????????????????????
    $('.ace_catalogue_drag_icon .drag_icon_conter').on('mousedown', function (e) {
      var _left = $('.aceEditors')[0].offsetLeft;
      $('.ace_gutter-layer').css('cursor', 'col-resize');
      $('#ace_conter').unbind().on('mousemove', function (ev) {
        var _width = (ev.clientX + 1) - _left;
        if (_width >= 265 && _width <= 450) {
          $('.ace_catalogue').css({ 'width': _width, 'transition': 'none' });
          $('.ace_editor_main').css({ 'marginLeft': _width, 'transition': 'none' });
          $('.ace_catalogue_drag_icon ').css('left', _width);
          $('.file_fold .newly_file_input').width($('.file_fold .newly_file_input').parent().parent().parent().width() - ($('.file_fold .newly_file_input').parent().parent().attr('data-group') * 15 - 5) - 20 - 30 - 53);
        }
      }).on('mouseup', function (ev) {
        $('.ace_gutter-layer').css('cursor', 'inherit');
        $('.ace_catalogue').css('transition', 'all 500ms');
        $('.ace_editor_main').css('transition', 'all 500ms');
        $(this).unbind('mouseup mousemove');
      });
    });
    // ???????????????????????????
    $('.ace_catalogue_drag_icon .fold_icon_conter').on('click', function (e) {
      if ($('.ace_overall').hasClass('active')) {
        $('.ace_overall').removeClass('active');
        $('.ace_catalogue').css('left', '0');
        $(this).removeClass('active').attr('title', '??????????????????');
        $('.ace_editor_main').css('marginLeft', $('.ace_catalogue').width());
      } else {
        $('.ace_overall').addClass('active');
        $('.ace_catalogue').css('left', '-' + $('.ace_catalogue').width() + 'px');
        $(this).addClass('active').attr('title', '??????????????????');
        $('.ace_editor_main').css('marginLeft', 0);
      }
      setTimeout(function () {
        if (_this.ace_active != '') _this.editor[_this.ace_active].ace.resize();
      }, 600);
    });
    // ??????????????????
    $('.ace_conter_tips').on('click', 'a', function () {
      _this.event_ecovery_file(this);
    });
    // ????????????
    $('.ace_catalogue_list').on('mousedown', '.has-children .file_fold', function (e) {
      var x = e.clientX, y = e.clientY, _left = $('.aceEditors')[0].offsetLeft, _top = $('.aceEditors')[0].offsetTop, _that = $('.ace_catalogue_list .has-children .file_fold'), _active = $('.ace_catalogue_list .has-children .file_fold.edit_file_group');
      $('.ace_toolbar_menu').hide();
      if (e.which === 3) {
        if ($(this).hasClass('edit_file_group')) return false;
        $('.ace_catalogue_menu').css({ 'display': 'block', 'left': x + 15, 'top': y + 10 });
        _that.removeClass('bg');
        $(this).addClass('bg');
        _active.attr('data-edit') != '2' ? _active.parent().remove() : '';
        _that.removeClass('edit_file_group').removeAttr('data-edit');
        _that.find('.file_input').siblings().show();
        _that.find('.file_input').remove();
        $('.ace_catalogue_menu li').show();
        if ($(this).attr('data-file') == 'Dir') {
          $('.ace_catalogue_menu li:nth-child(6)').hide();
        } else {
          $('.ace_catalogue_menu li:nth-child(-n+4)').hide();
        }
        $(document).click(function () {
          $('.ace_catalogue_menu').hide();
          $(this).unbind('click');
          return false;
        });
        _this.refresh_config = {
          el: $(this).parent().parent()[0],
          path: _this.get_file_dir($(this).parent().attr('data-menu-path'), 1),
          group: parseInt($(this).attr('data-group')),
          is_empty: true
        }
      }
    });
    // ????????????????????????
    $('.ace_catalogue_menu li').click(function (e) {
      _this.newly_file_type(this);
    });
    // ??????????????????????????????
    $('.ace_catalogue_list').on('click', '.has-children .edit_file_group .glyphicon-ok', function () {
      var _file_or_dir = $(this).parent().find('input').val(),
        _file_type = $(this).parent().parent().attr('data-file'),
        _path = $('.has-children .file_fold.bg').parent().attr('data-menu-path'),
        _type = parseInt($(this).parent().parent().attr('data-edit'));
      if ($(this).parent().parent().parent().attr('data-menu-path') === undefined && parseInt($(this).parent().parent().attr('data-group')) === 1) {
        // console.log('?????????')
        _path = $('.ace_catalogue_title').attr('title');
      }
      // 			return false;
      if (_file_or_dir === '') {
        $(this).prev().css('border', '1px solid #f34a4a');
        layer.tips(_type === 0 ? '????????????????????????' : (_type === 1 ? '?????????????????????' : '?????????????????????'), $(this).prev(), { tips: [1, '#f34a4a'], time: 0 });
        return false;
      } else if ($(this).prev().attr('data-type') == 0) {
        return false;
      }
      switch (_type) {
        case 0: //???????????????
          _this.event_create_dir({ path: _path + '/' + _file_or_dir });
          break;
        case 1: //????????????
          _this.event_create_file({ path: _path + '/' + _file_or_dir });
          break;
        case 2: //?????????
          _this.event_rename_currency({ sfile: _path, dfile: _this.get_file_dir(_path, 1) + '/' + _file_or_dir });
          break;
      }
    });
    // ??????????????????????????????
    $('.ace_catalogue_list').on('keyup', '.has-children .edit_file_group input', function (e) {
      var _type = $(this).parent().parent().attr('data-edit'),
        _arry = $('.has-children .file_fold.bg+ul>li');
      if (_arry.length == 0 && $(this).parent().parent().attr('data-group') == 1) _arry = $('.cd-accordion-menu>li')
      if (_type != 2) {
        for (var i = 0; i < _arry.length; i++) {
          if ($(_arry[i]).find('.file_title span').html() === $(this).val()) {
            $(this).css('border', '1px solid #f34a4a');
            $(this).attr('data-type', 0);
            layer.tips(_type == 0 ? '??????????????????????????????' : '??????????????????????????????', $(this)[0], { tips: [1, '#f34a4a'], time: 0 });
            return false
          }
        }
      }
      if (_type == 1 && $(this).val().indexOf('.')) $(this).prev().removeAttr('class').addClass(_this.get_file_suffix($(this).val()) + '-icon');
      $(this).attr('data-type', 1);
      $(this).css('border', '1px solid #528bff');
      layer.closeAll('tips');
      if (e.keyCode === 13) $(this).next().click();
      $('.ace_toolbar_menu').hide();
      $('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
      e.stopPropagation();
      e.preventDefault();
    });
    // ??????????????????????????????????????????
    $('.ace_catalogue_list').on('click', '.has-children .edit_file_group .glyphicon-remove', function () {
      layer.closeAll('tips');
      if ($(this).parent().parent().parent().attr('data-menu-path')) {
        $(this).parent().parent().removeClass('edit_file_group').removeAttr('data-edit');
        $(this).parent().siblings().show();
        $(this).parent().remove();
        return false;
      }
      $(this).parent().parent().parent().remove();
    });
    //???????????????????????????
    $('.ace_catalogue_list')[0].oncontextmenu = function () {
      return false;
    }
    $('.ace_conter_menu').dragsort({
      dragSelector: '.icon_file',
      itemSelector: 'li'
    });
    this.setEditorView();
    this.reader_file_dir_menu();
  },
  // 	?????????????????????????????????type???session???local
  setStorage: function (type, key, val) {
    if (type != "local" && type != "session") val = key, key = type, type = 'session';
    window[type + 'Storage'].setItem(key, val);
  },
  //???????????????????????????????????????type???session???local
  getStorage: function (type, key) {
    if (type != "local" && type != "session") key = type, type = 'session';
    return window[type + 'Storage'].getItem(key);
  },
  //???????????????????????????????????????type???session???local
  removeStorage: function (type, key) {
    if (type != "local" && type != "session") key = type, type = 'session';
    window[type + 'Storage'].removeItem(key);
  },
  // 	???????????????????????????????????????
  clearStorage: function (type) {
    if (type != "local" && type != "session") key = type, type = 'session';
    window[type + 'Storage'].clear();
  },

  // ??????????????????
  newly_file_type: function (that) {
    var _type = parseInt($(that).attr('data-type')),
      _active = $('.ace_catalogue .ace_catalogue_list .has-children .file_fold.bg'),
      _group = parseInt(_active.attr('data-group')),
      _path = _active.parent().attr('data-menu-path'), //?????????????????????
      _this = this;
    // console.log(_type);
    switch (_type) {
      case 0: //????????????
        _active.next().empty();
        _this.reader_file_dir_menu({
          el: _active.next(),
          path: _path,
          group: parseInt(_active.attr('data-group')) + 1,
          is_empty: true
        }, function () {
          layer.msg('????????????', { icon: 1 });
        });
        break;
      case 1: //????????????
        _this.menu_path = _path;
        _this.reader_file_dir_menu({
          el: '.cd-accordion-menu',
          path: _this.menu_path,
          group: 1,
          is_empty: true
        });
        break;
      case 2: //????????????
      case 3:
        if (this.get_file_dir(_path, 1) != this.menu_path) { //????????????????????????????????????????????????
          this.reader_file_dir_menu({ el: _active, path: _path, group: _group + 1 }, function (res) {
            _this.newly_file_type_dom(_active, _group, _type == 2 ? 0 : 1);
          });
        } else {
          _this.newly_file_type_dom(_active, _group, _type == 2 ? 0 : 1);
        }
        break;
      case 4: //???????????????
        var _types = _active.attr('data-file');
        if (_active.hasClass('active')) {
          layer.msg('???????????????????????????????????????', { icon: 0 });
          return false;
        }
        _active.attr('data-edit', 2);
        _active.addClass('edit_file_group');
        _active.find('.file_title').hide();
        _active.find('.glyphicon').hide();
        _active.prepend('<span class="file_input"><i class="' + (_types === 'Dir' ? 'folder' : (_this.get_file_suffix(_active.find('.file_title span').html()))) + '-icon"></i><input type="text" class="newly_file_input" value="' + (_active.find('.file_title span').html()) + '"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>')
        $('.file_fold .newly_file_input').width($('.file_fold .newly_file_input').parent().parent().parent().width() - ($('.file_fold .newly_file_input').parent().parent().attr('data-group') * 15 - 5) - 20 - 30 - 53);
        $('.file_fold .newly_file_input').focus();
        break;
      case 5:
        window.open('/download?filename=' + encodeURIComponent(_path));
        break;
      case 6:
        var is_files = _active.attr('data-file') === 'Files'
        layer.confirm(lan.get(is_files ? 'recycle_bin_confirm' : 'recycle_bin_confirm_dir', [_active.find('.file_title span').html()]), { title: is_files ? lan.files.del_file : lan.files.del_dir, closeBtn: 2, icon: 3 }, function (index) {
          _this[is_files ? 'del_file_req' : 'del_dir_req']({ path: _path }, function (res) {
            layer.msg(res.msg, { icon: res.status ? 1 : 2 });
            if (res.status) {
              if (_active.attr('data-group') != 1) _active.parent().parent().prev().addClass('bg')
              _this.reader_file_dir_menu(_this.refresh_config, function () {
                layer.msg(res.msg, { icon: 1 });
              });
            }
          });
        });
        break;
    }
  },
  // ????????????????????????
  newly_file_type_dom: function (_active, _group, _type, _val) {
    var _html = '', _this = this, _nextLength = _active.next(':not(.ace_catalogue_menu)').length;
    if (_nextLength > 0) {
      _active.next().show();
      _active.find('.glyphicon').removeClass('glyphicon-menu-right').addClass('glyphicon-menu-down');
    }
    _html += '<li class="has-children children_' + (_group + 1) + '"><div class="file_fold edit_file_group group_' + (_group + 1) + '" data-group="' + (_group + 1) + '" data-edit="' + _type + '"><span class="file_input">';
    _html += '<i class="' + (_type == 0 ? 'folder' : (_type == 1 ? 'text' : (_this.get_file_suffix(_val || '')))) + '-icon"></i>'
    _html += '<input type="text" class="newly_file_input" value="' + (_val != undefined ? _val : '') + '">'
    _html += '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></span></div></li>'
    if (_nextLength > 0) {
      _active.next().prepend(_html);
    } else {
      _active.prepend(_html);
    }
    setTimeout(function () {
      $('.newly_file_input').focus()
    }, 100)
    $('.file_fold .newly_file_input').width($('.file_fold .newly_file_input').parent().parent().parent().width() - ($('.file_fold .newly_file_input').parent().parent().attr('data-group') * 15 - 5) - 20 - 30 - 53);
    return false;
  },
  // ?????????????????????
  event_rename_currency: function (obj) {
    var _active = $('.ace_catalogue_list .has-children .file_fold.edit_file_group'), _this = this;
    this.rename_currency_req({ sfile: obj.sfile, dfile: obj.dfile }, function (res) {
      layer.msg(res.msg, { icon: res.status ? 1 : 2 });
      if (res.status) {
        _this.reader_file_dir_menu(_this.refresh_config, function () {
          layer.msg(res.msg, { icon: 1 });
        });
      } else {
        _active.find('.file_input').siblings().show();
        _active.find('.file_input').remove();
        _active.removeClass('edit_file_group').removeAttr('data-edit');
      }
    })
  },
  // ????????????????????????
  event_create_dir: function (obj) {
    var _this = this;
    this.create_dir_req({ path: obj.path }, function (res) {
      layer.msg(res.msg, { icon: res.status ? 1 : 2 });
      if (res.status) {
        _this.reader_file_dir_menu(_this.refresh_config, function () {
          layer.msg(res.msg, { icon: 1 });
        });
      }
    })
  },
  // ??????????????????
  event_create_file: function (obj) {
    var _this = this;
    this.create_file_req({ path: obj.path }, function (res) {
      layer.msg(res.msg, { icon: res.status ? 1 : 2 });
      if (res.status) {
        _this.reader_file_dir_menu(_this.refresh_config, function () {
          layer.msg(res.msg, { icon: 1 });
          _this.openEditorView(obj.path);
        });
      }
    })
  },
  // ???????????????
  rename_currency_req: function (obj, callback) {
    var loadT = layer.msg('??????????????????????????????????????????...', { time: 0, icon: 16, shade: [0.3, '#000'] });
    $.post("/files?action=MvFile", {
      sfile: obj.sfile,
      dfile: obj.dfile,
      rename: 'true'
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // ??????????????????
  create_file_req: function (obj, callback) {
    var loadT = layer.msg('??????????????????????????????...', { time: 0, icon: 16, shade: [0.3, '#000'] });
    $.post("/files?action=CreateFile", {
      path: obj.path
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // ??????????????????
  create_dir_req: function (obj, callback) {
    var loadT = layer.msg('??????????????????????????????...', { time: 0, icon: 16, shade: [0.3, '#000'] });
    $.post("/files?action=CreateDir", {
      path: obj.path
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // ??????????????????
  del_file_req: function (obj, callback) {
    var loadT = layer.msg('??????????????????????????????...', { time: 0, icon: 16, shade: [0.3, '#000'] });
    $.post("/files?action=DeleteFile", {
      path: obj.path
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // ??????????????????
  del_dir_req: function (obj, callback) {
    var loadT = layer.msg('????????????????????????????????????...', { time: 0, icon: 16, shade: [0.3, '#000'] });
    $.post("/files?action=DeleteDir", {
      path: obj.path
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // ??????????????????
  auto_save_temp: function (obj, callback) {
    // var loadT = layer.msg('??????????????????????????????...',{time: 0,icon: 16,shade: [0.3, '#000']});
    $.post("/files?action=auto_save_temp", {
      filename: obj.filename,
      body: obj.body
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // ????????????????????????
  get_auto_save_body: function (obj, callback) {
    var loadT = layer.msg('????????????????????????????????????????????????...', { time: 0, icon: 16, shade: [0.3, '#000'] });
    $.post("/files?action=get_auto_save_body", {
      filename: obj.filename
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // ????????????????????????
  event_ecovery_file: function (that) {
    var _path = $(that).attr('data-path'), _history = new Number($(that).attr('data-history')), _this = this;
    var loadT = layer.open({
      type: 1,
      area: ['400px', '180px'],
      title: '??????????????????',
      content: '<div class="ace-clear-form">\
				<div class="clear-icon"></div>\
				<div class="clear-title">????????????????????????&nbsp<span class="size_ellipsis" style="max-width:150px;vertical-align: top;" title="' + bt.format_data(_history) + '">' + bt.format_data(_history) + '</span>?</div>\
				<div class="clear-tips">????????????????????????????????????????????????????????????</div>\
				<div class="ace-clear-btn" style="">\
					<button type="button" class="btn btn-sm btn-default" style="margin-right:10px;" data-type="1">??????</button>\
					<button type="button" class="btn btn-sm btn-success" data-type="0">??????????????????</button>\
				</div>\
			</div>',
      success: function (layero, index) {
        $('.ace-clear-btn .btn').click(function () {
          var _type = $(this).attr('data-type');
          switch (_type) {
            case '0':
              _this.recovery_file_history({
                filename: _path,
                history: _history
              }, function (res) {
                layer.close(index);
                layer.msg(res.status ? '????????????????????????' : '????????????????????????', { icon: res.status ? 1 : 2 });
                if (res.status) {
                  if (_this.editor[_this.ace_active].historys_file) {
                    _this.removeEditor(_this.ace_active);
                  }
                  if ($('.ace_conter_menu>[title="' + _path + '"]').length > 0) {
                    $('.ace_header .refreshs').click();
                    layer.close(_this.layer_view);
                  }
                }
              });
              break;
            case '1':
              layer.close(index);
              break;
          }
        });
      }
    });
  },
  // ???????????????????????????
  is_file_history: function (_item) {
    if (_item == undefined) return false;
    if (_item.historys_file) {
      $('.ace_conter_tips').show();
      $('#ace_editor_' + _item.id).css('bottom', '50px');
      $('.ace_conter_tips .tips').html('????????????????????????' + _item.path + '??????????????? [ ' + bt.format_data(new Number(_item.historys_active)) + ' ]<a href="javascript:;" class="ml35 btlink" style="margin-left:35px" data-path="' + _item.path + '" data-history="' + _item.historys_active + '">??????????????????????????????</a>');
    } else {
      $('.ace_conter_tips').hide();
    }
  },
  // ????????????????????????
  is_file_open: function (path, callabck) {
    var is_state = false
    for (var i = 0; i < this.pathAarry.length; i++) {
      if (path === this.pathAarry[i]) is_state = true
    }
    if (callabck) {
      callabck(is_state);
    } else {
      return is_state;
    }
  },
  // ??????????????????
  recovery_file_history: function (obj, callback) {
    var loadT = layer.msg('????????????????????????????????????...', { time: 0, icon: 16, shade: [0.3, '#000'] });
    $.post("/files?action=re_history", {
      filename: obj.filename,
      history: obj.history
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // ??????????????????
  get_file_dir_list: function (obj, callback) {
    var loadT = layer.msg('????????????????????????????????????...', { time: 0, icon: 16, shade: [0.3, '#000'] }), _this = this;
    if (obj['p'] === undefined) obj['p'] = 1;
    if (obj['showRow'] === undefined) obj['showRow'] = 200;
    if (obj['sort'] === undefined) obj['sort'] = 'name';
    if (obj['reverse'] === undefined) obj['reverse'] = 'False';
    if (obj['search'] === undefined) obj['search'] = '';
    if (obj['all'] === undefined) obj['all'] = 'False';
    $.post("/files?action=GetDir&tojs=GetFiles", { p: obj.p, showRow: obj.showRow, sort: obj.sort, reverse: obj.reverse, path: obj.path, search: obj.search }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // ??????????????????
  get_file_history: function (obj, callback) {
    var loadT = layer.msg('??????????????????????????????????????????...', { time: 0, icon: 16, shade: [0.3, '#000'] }), _this = this;
    $.post("/files?action=read_history", { filename: obj.filename, history: obj.history }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // ??????????????????
  reader_file_dir_menu: function (obj, callback) {
    var _path = getCookie('Path'), _this = this;
    if (obj === undefined) obj = {}
    if (obj['el'] === undefined) obj['el'] = '.cd-accordion-menu';
    if (obj['group'] === undefined) obj['group'] = 1;
    if (obj['p'] === undefined) obj['p'] = 1;
    if (obj['path'] === undefined) obj['path'] = _path;
    if (obj['search'] === undefined) obj['search'] = '';
    if (obj['is_empty'] === undefined) obj['is_empty'] = false;
    if (obj['all'] === undefined) obj['all'] = 'False'
    this.get_file_dir_list({ p: obj.p, path: obj.path, search: obj.search, all: obj.all }, function (res) {
      var _dir = res.DIR, _files = res.FILES, _dir_dom = '', _files_dom = '', _html = '';
      _this.menu_path = res.PATH;
      for (var i = 0; i < _dir.length; i++) {
        var _data = _dir[i].split(';');
        if (_data[0] === '__pycache__') continue;
        _dir_dom += '<li class="has-children children_' + obj.group + '" title="' + (obj.path + '/' + _data[0]) + '" data-menu-path="' + (obj.path + '/' + _data[0]) + '" data-size="' + (_data[1]) + '">\
					<div class="file_fold group_'+ obj.group + '" data-group="' + obj.group + '" data-file="Dir">\
						<span class="glyphicon glyphicon-menu-right"></span>\
						<span class="file_title"><i class="folder-icon"></i><span>'+ _data[0] + '</span></span>\
					</div>\
					<ul data-group=""></ul>\
					<span class="has_children_separator"></span>\
				</li>';
      }
      for (var j = 0; j < _files.length; j++) {
        var _data = _files[j].split(';');
        if (_data[0].indexOf('.pyc') !== -1) continue;
        _files_dom += '<li class="has-children" title="' + (obj.path + '/' + _data[0]) + '" data-menu-path="' + (obj.path + '/' + _data[0]) + '" data-size="' + (_data[1]) + '" data-suffix="' + _this.get_file_suffix(_data[0]) + '">\
					<div class="file_fold  group_'+ obj.group + '" data-group="' + obj.group + '" data-file="Files">\
						<span class="file_title"><i class="'+ _this.get_file_suffix(_data[0]) + '-icon text-icon"></i><span>' + _data[0] + '</span></span>\
					</div>\
				</li>';
      }
      if (res.PATH !== '/' && obj['group'] === 1) {
        $('.upper_level').attr('data-menu-path', _this.get_file_dir(res.PATH, 1));
        $('.ace_catalogue_title').html('?????????' + res.PATH).attr('title', res.PATH);
        $('.upper_level').html('<i class="glyphicon glyphicon-share-alt" aria-hidden="true"></i>?????????')
      } else if (res.PATH === '/') {
        $('.upper_level').html('<i class="glyphicon glyphicon-hdd" aria-hidden="true"></i>?????????')
      }
      if (obj.is_empty) $(obj.el).empty();
      $(obj.el).append(_html + _dir_dom + _files_dom);
      if (callback) callback(res);
    });
  },
  // ????????????????????????
  get_file_dir: function (path, num) {
    var _arry = path.split('/');
    if (path === '/') return '/';
    _arry.splice(-1, num);
    return _arry == '' ? '/' : _arry.join('/');
  },
  // ??????????????????
  get_file_suffix: function (fileName) {
    var filenames = fileName.match(/\.([0-9A-z]*)$/);
    filenames = (filenames == null ? 'text' : filenames[1]);
    for (var name in this.aceConfig.supportedModes) {
      var data = this.aceConfig.supportedModes[name], suffixs = data[0].split('|'), filename = name.toLowerCase();
      for (var i = 0; i < suffixs.length; i++) {
        if (filenames == suffixs[i]) return filename;
      }
    }
    return 'text';
  },
  // ?????????????????????
  setEditorView: function () {
    var aceEditorHeight = $('.aceEditors').height(), _this = this;
    var autoAceHeight = setInterval(function () {
      var page_height = $('.aceEditors').height();
      var ace_conter_menu = $('.ace_conter_menu').height();
      var ace_conter_toolbar = $('.ace_conter_toolbar').height();
      var _height = page_height - ($('.pull-down .glyphicon').hasClass('glyphicon-menu-down') ? 35 : 0) - ace_conter_menu - ace_conter_toolbar - 42;
      $('.ace_conter_editor').height(_height);
      if (aceEditorHeight == $('.aceEditors').height()) {
        if (_this.ace_active) _this.editor[_this.ace_active].ace.resize();
        clearInterval(autoAceHeight);
      } else {
        aceEditorHeight = $('.aceEditors').height();
      }
    }, 200);
  },
  // ????????????????????????
  getEncodingList: function (type) {
    var _option = '';
    for (var i = 0; i < this.aceConfig.encodingList.length; i++) {
      var item = this.aceConfig.encodingList[i] == type.toUpperCase();
      _option += '<li data- data-value="' + this.aceConfig.encodingList[i] + '" ' + (item ? 'class="active"' : '') + '>' + this.aceConfig.encodingList[i] + (item ? '<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>' : '') + '</li>';
    }
    $('.menu-encoding ul').html(_option);
  },
  // ????????????????????????
  getRelevanceList: function (fileName) {
    var _option = '', _top = 0, fileType = this.getFileType(fileName), _set_tops = 0;
    for (var name in this.aceConfig.supportedModes) {
      var data = this.aceConfig.supportedModes[name], item = (name == fileType.name);
      _option += '<li data-height="' + _top + '" data-rule="' + this.aceConfig.supportedModes[name] + '" data-value="' + name + '" ' + (item ? 'class="active"' : '') + '>' + (this.aceConfig.nameOverrides[name] || name) + (item ? '<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>' : '') + '</li>'
      if (item) _set_tops = _top
      _top += 35;
    }
    $('.menu-files ul').html(_option);
    $('.menu-files ul').scrollTop(_set_tops);
  },
  // ??????????????????
  searchRelevance: function (search) {
    if (search == undefined) search = '';
    $('.menu-files ul li').each(function (index, el) {
      var val = $(this).attr('data-value').toLowerCase(),
        rule = $(this).attr('data-rule'),
        suffixs = rule.split('|'),
        _suffixs = false;
      search = search.toLowerCase();
      for (var i = 0; i < suffixs.length; i++) {
        if (suffixs[i].indexOf(search) > -1) _suffixs = true
      }
      if (search == '') {
        $(this).removeAttr('style');
      } else {
        if (val.indexOf(search) == -1) {
          $(this).attr('style', 'display:none');
        } else {
          $(this).removeAttr('style');
        }
        if (_suffixs) $(this).removeAttr('style')
      }
    });
  },
  // ??????????????????
  setEncodingType: function (encode) {
    this.getEncodingList('UTF-8');
    $('.menu-encoding ul li').click(function (e) {
      layer.msg('?????????????????????' + $(this).attr('data-value'));
      $(this).addClass('active').append('<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>').siblings().removeClass('active').find('span').remove();
    });
  },
  // ???????????????
  currentStatusBar: function (id) {
    var _item = this.editor[id];
    if (_item == undefined) {
      this.removerStatusBar();
      return false;
    }
    $('.ace_conter_toolbar [data-type="cursor"]').html('???<i class="cursor-row">1</i>,???<i class="cursor-line">0</i>');
    $('.ace_conter_toolbar [data-type="history"]').html('???????????????<i>' + (_item.historys.length === 0 ? '???' : _item.historys.length + '???') + '</i>');
    $('.ace_conter_toolbar [data-type="path"]').html('???????????????<i title="' + _item.path + '">' + _item.path + '</i>');
    $('.ace_conter_toolbar [data-type="tab"]').html(_item.softTabs ? '?????????<i>' + _item.tabSize + '</i>' : '??????????????????<i>' + _item.tabSize + '</i>');
    $('.ace_conter_toolbar [data-type="encoding"]').html('?????????<i>' + _item.encoding.toUpperCase() + '</i>');
    var readOnly = $('.ace_conter_toolbar [data-type="readOnly"]')
    if(_item.readOnly){
      readOnly.show().text('????????????').css('background','#ff9200')
    }else{
      readOnly.hide()
    }
    console.log(_item.readOnly)
    $('.ace_conter_toolbar [data-type="lang"]').html('?????????<i>' + _item.type + '</i>');
    $('.ace_conter_toolbar span').attr('data-id', id);
    $('.file_fold').removeClass('bg');
    $('[data-menu-path="' + (_item.path) + '"]').find('.file_fold').addClass('bg');
    if (_item.historys_file) {
      $('.ace_conter_toolbar [data-type="history"]').hide();
    } else {
      $('.ace_conter_toolbar [data-type="history"]').show();
    }
    _item.ace.resize();
  },
  // ???????????????
  removerStatusBar: function () {
    $('.ace_conter_toolbar [data-type="history"]').html('');
    $('.ace_conter_toolbar [data-type="path"]').html('');
    $('.ace_conter_toolbar [data-type="tab"]').html('');
    $('.ace_conter_toolbar [data-type="cursor"]').html('');
    $('.ace_conter_toolbar [data-type="encoding"]').html('');
    $('.ace_conter_toolbar [data-type="lang"]').html('');
    $('.ace_conter_toolbar [data-type="readOnly"]').hide();
  },
  // ??????ACE?????????-??????
  creationEditor: function (obj, callabck) {
    var _this = this;
    $('#ace_editor_' + obj.id).text(obj.data || '');
    $('.ace_conter_editor .ace_editors').css('fontSize', _this.fontSize + 'px');
    if (this.editor == null) this.editor = {};
    this.editor[obj.id] = {
      ace: ace.edit("ace_editor_" + obj.id, {
        theme: "ace/theme/" + _this.aceConfig.aceEditor.editorTheme, //??????
        mode: "ace/mode/" + (obj.fileName != undefined ? obj.mode : 'text'), // ????????????
        wrap: _this.aceConfig.aceEditor.wrap,
        showInvisibles: _this.aceConfig.aceEditor.showInvisibles,
        showPrintMargin: false,
        enableBasicAutocompletion: true,
        enableSnippets: _this.aceConfig.aceEditor.enableSnippets,
        enableLiveAutocompletion: _this.aceConfig.aceEditor.enableLiveAutocompletion,
        useSoftTabs: _this.aceConfig.aceEditor.useSoftTabs,
        tabSize: _this.aceConfig.aceEditor.tabSize,
        keyboardHandler: 'sublime',
        readOnly: obj.readOnly === undefined ? false : obj.readOnly
      }), //ACE???????????????
      id: obj.id,
      wrap: _this.aceConfig.aceEditor.wrap, //????????????
      path: obj.path,
      tabSize: _this.aceConfig.aceEditor.tabSize,
      softTabs: _this.aceConfig.aceEditor.useSoftTabs,
      fileName: obj.fileName,
      enableSnippets: true, //??????????????????
      encoding: (obj.encoding != undefined ? obj.encoding : 'utf-8'), //????????????
      mode: (obj.fileName != undefined ? obj.mode : 'text'), //????????????
      type: obj.type,
      fileType: 0, //???????????? 
      historys: obj.historys,
      historys_file: obj.historys_file === undefined ? false : obj.historys_file,
      historys_active: obj.historys_active === '' ? false : obj.historys_active,
      readOnly: obj.readOnly === undefined ? false : obj.readOnly
    };
    var ACE = this.editor[obj.id];
    ACE.ace.moveCursorTo(0, 0); //??????????????????
    ACE.ace.resize(); //???????????????
    if(!ACE.readOnly) ACE.ace.focus()
    ACE.ace.on('focus', function () {
      var active = aceEditor.editor[aceEditor.ace_active]
      if(active.readOnly) layer.msg('???????????????????????????????????????',{icon:0})
    })
    ACE.ace.commands.addCommand({
      name: '????????????',
      bindKey: {
        win: 'Ctrl-S',
        mac: 'Command-S'
      },
      exec: function (editor) {
        _this.saveFileMethod(ACE);
      },
      readOnly: false // ????????????????????????????????????????????????false
    });
    ACE.ace.commands.addCommand({
      name: '?????????',
      bindKey: {
        win: 'Ctrl-I',
        mac: 'Command-I'
      },
      exec: function (editor) {
        $('.ace_header .jumpLine').click();
      },
      readOnly: false // ????????????????????????????????????????????????false
    })
    // ??????????????????
    ACE.ace.getSession().selection.on('changeCursor', function (e) {
      var _cursor = ACE.ace.selection.getCursor();
      $('[data-type="cursor"]').html('???<i class="cursor-row">' + (_cursor.row + 1) + '</i>,???<i class="cursor-line">' + _cursor.column + '</i>');
    });

    // ??????????????????
    ACE.ace.getSession().on('change', function (editor) {
      $('.item_tab_' + ACE.id + ' .icon-tool').addClass('glyphicon-exclamation-sign').removeClass('glyphicon-remove').attr('data-file-state', '1');
      ACE.fileType = 1;
      $('.ace_toolbar_menu').hide();
    });
    this.currentStatusBar(ACE.id);
    this.is_file_history(ACE);
  },
  // ??????????????????
  saveFileMethod: function (ACE) {
    if ($('.item_tab_' + ACE.id + ' .icon-tool').attr('data-file-state') == 0) {
      layer.msg('????????????????????????????????????!');
      return false;
    }
    $('.item_tab_' + ACE.id + ' .icon-tool').attr('title', '???????????????????????????..').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-repeat');
    layer.msg('???????????????????????????<img src="/static/img/ns-loading.gif" style="width:15px;margin-left:5px">', { icon: 0 });
    this.saveFileBody({
      path: ACE.path,
      data: ACE.ace.getValue(),
      encoding: ACE.encoding
    }, function (res) {
      ACE.fileType = 0;
      $('.item_tab_' + ACE.id + ' .icon-tool').attr('data-file-state', '0').removeClass('glyphicon-repeat').addClass('glyphicon-remove');
    }, function (res) {
      ACE.fileType = 1;
      $('.item_tab_' + ACE.id + ' .icon-tool').attr('data-file-state', '1').removeClass('glyphicon-remove').addClass('glyphicon-repeat');
    });
  },
  // ??????????????????
  getFileType: function (fileName) {
    var filenames = fileName.match(/\.([0-9A-z]*)$/);
    filenames = (filenames == null ? 'text' : filenames[1]);
    for (var name in this.aceConfig.supportedModes) {
      var data = this.aceConfig.supportedModes[name], suffixs = data[0].split('|'), filename = name.toLowerCase();
      for (var i = 0; i < suffixs.length; i++) {
        if (filenames == suffixs[i]) {
          return { name: name, mode: filename };
        }
      }
    }
    return { name: 'Text', mode: 'text' };
  },
  // ?????????????????????-??????
  addEditorView: function (type, conifg) {
    if (type == undefined) type = 0
    var _index = this.editorLength, _id = bt.get_random(8);
    $('.ace_conter_menu .item').removeClass('active');
    $('.ace_conter_editor .ace_editors').removeClass('active');
    $('.ace_conter_menu').append('<li class="item active item_tab_' + _id + '" data-type="shortcutKeys" data-id="' + _id + '" >\
			<div class="ace_item_box">\
				<span class="icon_file"><i class="text-icon"></i></span>\
				<span>'+ (type ? conifg.title : ('????????????-' + _index)) + '</span>\
				<i class="glyphicon icon-tool glyphicon-remove" aria-hidden="true" data-file-state="0" data-title="'+ (type ? conifg.title : ('????????????-' + _index)) + '"></i>\
			</div>\
		</li>');
    $('#ace_editor_' + _id).siblings().removeClass('active');
    $('.ace_conter_editor').append('<div id="ace_editor_' + _id + '" class="ace_editors active">' + (type ? aceShortcutKeys.innerHTML : '') + '</div>');
    switch (type) {
      case 0:
        this.creationEditor({ id: _id });
        this.editorLength = this.editorLength + 1;
        break;
      case 1:
        this.removerStatusBar();
        this.editorLength = this.editorLength + 1;
        break;
    }
  },
  // ?????????????????????-??????
  removeEditor: function (id) {
    if (id == undefined) id = this.ace_active;
    if ($('.item_tab_' + id).next().length != 0 && this.editorLength != 1) {
      $('.item_tab_' + id).next().click();
    } else if ($('.item_tab_' + id).prev.length != 0 && this.editorLength != 1) {
      $('.item_tab_' + id).prev().click();
    }
    $('.item_tab_' + id).remove();
    $('#ace_editor_' + id).remove();
    this.editorLength--;
    if (this.editor[id] == undefined) return false;
    for (var i = 0; i < this.pathAarry.length; i++) {
      if (this.pathAarry[i] == this.editor[id].path) {
        this.pathAarry.splice(i, 1);
      }
    }
    if (!this.editor[id].historys_file) $('[data-menu-path="' + (this.editor[id].path) + '"]').find('.file_fold').removeClass('active bg');
    this.editor[id].ace.destroy();
    delete this.editor[id];
    if (this.editorLength === 0) {
      this.ace_active = '';
      this.pathAarry = [];
      this.removerStatusBar();
    } else {
      this.currentStatusBar(this.ace_active);
    }
    if (this.ace_active != '') this.is_file_history(this.editor[this.ace_active]);
  },
  // ????????????????????????-??????
  openHistoryEditorView: function (obj, callback) {
    // ???????????????type????????????JavaScript??? ??????????????????mode????????????text?????????????????????id,?????????x8AmsnYn?????????????????????index,?????????0?????????????????? (path????????????/www/root/)
    var _this = this, path = obj.filename, paths = path.split('/'), _fileName = paths[paths.length - 1], _fileType = this.getFileType(_fileName), _type = _fileType.name, _mode = _fileType.mode, _id = bt.get_random(8), _index = this.editorLength;
    this.get_file_history({ filename: obj.filename, history: obj.history }, function (res) {
      _this.pathAarry.push(path);
      $('.ace_conter_menu .item').removeClass('active');
      $('.ace_conter_editor .ace_editors').removeClass('active');
      $('.ace_conter_menu').append('<li class="item active item_tab_' + _id + '" title="' + path + '" data-type="' + _type + '" data-mode="' + _mode + '" data-id="' + _id + '" data-fileName="' + _fileName + '">' +
        '<div class="ace_item_box">' +
        '<span class="icon_file"><img src="/static/img/ico-history.png"></span><span title="' + path + ' ????????????[ ' + bt.format_data(obj.history) + ' ]' + '">' + _fileName + '</span>' +
        '<i class="glyphicon glyphicon-remove icon-tool" aria-hidden="true" data-file-state="0" data-title="' + _fileName + '"></i>' +
        '</div>' +
        '</li>');
      $('.ace_conter_editor').append('<div id="ace_editor_' + _id + '" class="ace_editors active"></div>');
      $('[data-paths="' + path + '"]').find('.file_fold').addClass('active bg');
      _this.ace_active = _id;
      _this.editorLength = _this.editorLength + 1;
      _this.creationEditor({ id: _id, fileName: _fileName, path: path, mode: _mode, encoding: res.encoding, data: res.data, type: _type, historys: res.historys, readOnly: true, historys_file: true, historys_active: obj.history });
      if (callback) callback(res);
    });
  },
  // ?????????????????????-??????
  openEditorView: function (path, callback) {
    if($('.layui-layer-maxmin').length) $('.layui-layer-maxmin').click()
    if (path == undefined) return false;
    // ???????????????type????????????JavaScript??? ??????????????????mode????????????text?????????????????????id,?????????x8AmsnYn?????????????????????index,?????????0?????????????????? (path????????????/www/root/)
    var _this = this, paths = path.split('/'), _fileName = paths[paths.length - 1], _fileType = this.getFileType(_fileName), _type = _fileType.name, _mode = _fileType.mode, _id = bt.get_random(8), _index = this.editorLength;
    _this.is_file_open(path, function (is_state) {
      if (is_state) {
        $('.ace_conter_menu').find('[title="' + path + '"]').click();
      } else {
        _this.getFileBody({ path: path }, function (res) {
          _this.pathAarry.push(path);
          $('.ace_conter_menu .item').removeClass('active');
          $('.ace_conter_editor .ace_editors').removeClass('active');
          $('.ace_conter_menu').append('<li class="item active item_tab_' + _id + '" title="' + path + '" data-type="' + _type + '" data-mode="' + _mode + '" data-id="' + _id + '" data-fileName="' + _fileName + '">' +
            '<div class="ace_item_box">' +
            '<span class="icon_file"><i class="' + _mode + '-icon"></i></span><span title="' + path + '">' + _fileName + '</span>' +
            '<i class="glyphicon glyphicon-remove icon-tool" aria-hidden="true" data-file-state="0" data-title="' + _fileName + '"></i>' +
            '</div>' +
            '</li>');
          $('.ace_conter_editor').append('<div id="ace_editor_' + _id + '" class="ace_editors active" style="font-size:' + aceEditor.aceConfig.aceEditor.fontSize + 'px"></div>');
          $('[data-menu-path="' + path + '"]').find('.file_fold').addClass('active bg');
          _this.ace_active = _id;
          _this.editorLength = _this.editorLength + 1;
          if(res.only_read && res.size > 3145928) layer.msg('??????????????????3MB?????????????????????10000?????????',{icon:0,area:'380px'});
          _this.creationEditor({ id: _id, fileName: _fileName, path: path, mode: _mode, encoding: res.encoding, data: res.data, type: _type, historys: res.historys, readOnly: res.only_read, size:res.size });
          if (callback) callback(res, _this.editor[_this.ace_active]);
        });
      }
    });
    $('.ace_toolbar_menu').hide();
  },
  // ?????????????????????-??????
  getFavoriteList: function () { },
  // ??????????????????-??????
  getFileList: function () { },
  // ??????????????????-??????
  getFileBody: function (obj, callback) {
    var loadT = layer.msg('????????????????????????????????????...', { time: 0, icon: 16, shade: [0.3, '#000'] }), _this = this;
    $.post("/files?action=GetFileBody", "path=" + encodeURIComponent(obj.path), function (res) {
      layer.close(loadT);
      if (!res.status) {
        if (_this.editorLength == 0) layer.closeAll();
        layer.msg(res.msg, { icon: 2 });

        return false;
      } else {
        if (!aceEditor.isAceView) {
          var _path = obj.path.split('/');
          layer.msg('??????????????????' + (_path[_path.length - 1]) + '???');
        }
      }
      if (callback) callback(res);
    });
  },
  // ??????????????????-??????
  saveFileBody: function (obj, success, error) {
    $.ajax({
      type: 'post',
      url: '/files?action=SaveFileBody',
      timeout: 7000, //????????????????????????
      data: {
        data: obj.data,
        encoding: obj.encoding.toLowerCase(),
        path: obj.path
      },
      success: function (rdata) {
        if (rdata.status) {
          if (success) success(rdata)
        } else {
          if (error) error(rdata)
        }
        if (!obj.tips) layer.msg(rdata.msg, { icon: rdata.status ? 1 : 2 });
      },
      error: function (err) {
        if (error) error(err)
      }
    });
  },
  // 	??????ace??????
  saveAceConfig: function (data, callback) {
    var loadT = layer.msg('????????????????????????????????????...', { time: 0, icon: 16, shade: [0.3, '#000'] }), _this = this;
    this.saveFileBody({
      path: '/www/server/panel/BTPanel/static/editor/ace.editor.config.json',
      data: JSON.stringify(data),
      encoding: 'utf-8',
      tips: true,
    }, function (rdata) {
      layer.close(loadT);
      _this.setStorage('aceConfig', JSON.stringify(data));
      if (callback) callback(rdata);
    });
  },
  // ??????????????????
  getAceConfig: function (callback) {
    var loadT = layer.msg('????????????????????????????????????...', { time: 0, icon: 16, shade: [0.3, '#000'] }), _this = this;
    this.getFileBody({ path: '/www/server/panel/BTPanel/static/editor/ace.editor.config.json' }, function (rdata) {
      layer.close(loadT);
      _this.setStorage('aceConfig', JSON.stringify(rdata.data));
      if (callback) callback(JSON.parse(rdata.data));
    });
  },
  // ??????????????????
  saveAllFileBody: function (arry, num, callabck) {
    var _this = this;
    if (typeof num == "function") {
      callabck = num; num = 0;
    } else if (typeof num == "undefined") {
      num = 0;
    }
    if (num == arry.length) {
      if (callabck) callabck();
      layer.msg('??????????????????', { icon: 1 });
      return false;
    }
    aceEditor.saveFileBody({
      path: arry[num].path,
      data: arry[num].data,
      encoding: arry[num].encoding
    }, function () {
      num = num + 1;
      aceEditor.saveAllFileBody(arry, num, callabck);
    });
  }
}

function openEditorView (type, path, callback) {
  var paths = path.split('/'),
    _fileName = paths[paths.length - 1],
    _aceTmplate = document.getElementById("aceTmplate").innerHTML;
  _aceTmplate = _aceTmplate.replace(/\<\\\/script\>/g, '</script>');
  if (aceEditor.editor !== null) {
    if (aceEditor.isAceView == false) {
      aceEditor.isAceView = true;
      $('.aceEditors .layui-layer-max').click();
    }
    aceEditor.openEditorView(path);
    return false;
  }
  var r = layer.open({
    type: 1,
    maxmin: true,
    shade: false,
    anim:-1,
    area: ['80%', '80%'],
    title: "?????????????????????",
    skin: 'aceEditors',
    zIndex: 19999,
    content: _aceTmplate,
    success: function (layero, index) {
      function set_edit_file () {
        aceEditor.ace_active = '';
        aceEditor.eventEditor();
        ace.require("/ace/ext/language_tools");
        ace.config.set("modePath", "/static/editor");
        ace.config.set("workerPath", "/static/editor");
        ace.config.set("themePath", "/static/editor");
        aceEditor.openEditorView(path, callback);
        $('#ace_conter').addClass(aceEditor.aceConfig.aceEditor.editorTheme);
        $('.aceEditors .layui-layer-min').click(function (e) {
          aceEditor.setEditorView();
        });
        $('.aceEditors .layui-layer-max').click(function (e) {
          aceEditor.setEditorView();
        });
      }
      var aceConfig = aceEditor.getStorage('aceConfig');
      if (aceConfig == null) {
        // ?????????????????????
        aceEditor.getAceConfig(function (res) {
          aceEditor.aceConfig = res; // ??????????????????
          set_edit_file();
        });
      } else {
        aceEditor.aceConfig = JSON.parse(aceConfig);
        typeof aceEditor.aceConfig == 'string' ? aceEditor.aceConfig = JSON.parse(aceEditor.aceConfig) : ''
        set_edit_file();
      }
    },
    cancel: function () {
      for (var item in aceEditor.editor) {
        if (aceEditor.editor[item].fileType == 1) {
          layer.open({
            type: 1,
            area: ['400px', '180px'],
            title: '????????????',
            content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">??????????????????????????????????????????????????????</div>\
							<div class="clear-tips">????????????????????????????????????</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default" style="float:left" data-type="2">???????????????</button>\
								<button type="button" class="btn btn-sm btn-default" style="margin-right:10px;" data-type="1">??????</button>\
								<button type="button" class="btn btn-sm btn-success" data-type="0">????????????</button>\
							</div>\
						</div>',
            success: function (layers, indexs) {
              $('.ace-clear-btn button').click(function () {
                var _type = $(this).attr('data-type');
                switch (_type) {
                  case '2':
                    aceEditor.editor = null;
                    aceEditor.editorLength = 0;
                    aceEditor.pathAarry = [];
                    layer.closeAll();
                    break;
                  case '1':
                    layer.close(indexs);
                    break;
                  case '0':
                    var _arry = [], editor = aceEditor['editor'];
                    for (var item in editor) {
                      _arry.push({
                        path: editor[item]['path'],
                        data: editor[item]['ace'].getValue(),
                        encoding: editor[item]['encoding'],
                      })
                    }
                    aceEditor.saveAllFileBody(_arry, function () {
                      $('.ace_conter_menu>.item').each(function (el, indexx) {
                        var _id = $(this).attr('data-id');
                        $(this).find('i').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove').attr('data-file-state', '0')
                        aceEditor.editor[_id].fileType = 0;
                      });
                      aceEditor.editor = null;
                      aceEditor.pathAarry = [];
                      layer.closeAll();
                    });
                    break;
                }
              });
            }
          });
          return false;
        }
      }
    },
    end: function () {
      aceEditor.ace_active = '';
      aceEditor.editor = null;
      aceEditor.pathAarry = [];
      aceEditor.menu_path = '';
    }
  });
}


/**
 * AES??????
 * @param {string} s_text ????????????????????????
 * @param {string} s_key 16?????????
 * @param {array} ctx ?????????????????? { mode: CryptoJS.mode.ECB,padding: CryptoJS.pad.ZeroPadding }
 * @return {string} 
 */
function aes_encrypt (s_text, s_key, ctx) {
  if (ctx == undefined) ctx = { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding }
  var key = CryptoJS.enc.Utf8.parse(s_key);
  var encrypt_data = CryptoJS.AES.encrypt(s_text, key, ctx);
  return encrypt_data.toString();
}

/**
 * AES??????
 * @param {string} s_text ?????????????????????
 * @param {string} s_key 16?????????
 * @param {array} ctx ?????????????????? { mode: CryptoJS.mode.ECB,padding: CryptoJS.pad.ZeroPadding }
 * @return {string}
 */
function aes_decrypt (s_text, s_key, ctx) {
  if (ctx == undefined) ctx = { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding }
  var key = CryptoJS.enc.Utf8.parse(s_key);
  var decrypt_data = CryptoJS.AES.decrypt(s_text, key, ctx);
  return decrypt_data.toString(CryptoJS.enc.Utf8);
}

/**
 * ajax????????????
 * @param {string} data ?????????????????????
 * @param {string} stype ajax????????????????????????
 * @return {string} ????????????????????????
 */
function ajax_decrypt (data, stype) {
  if (!data) return data;
  if (data.substring(0, 6) == "BT-CRT") {
    var token = $("#request_token_head").attr("token")
    var pwd = token.substring(0, 8) + token.substring(40, 48)
    data = aes_decrypt(data.substring(6), pwd);
    if (stype == undefined) {
      stype = '';
    }
    if (stype.toLowerCase() != 'json') {
      data = JSON.parse(data);
    }
  }
  return data
}
/**
 * ?????????form_data??????????????????
 * @param {string} form_data ????????????form_data??????
 * @return {string} ????????????form_data??????
 */
function format_form_data (form_data) {
  var data_tmp = form_data.split('&');
  var form_info = {}
  var token = $("#request_token_head").attr("token")
  if (!token) return form_data;
  var pwd = token.substring(0, 8) + token.substring(40, 48)
  for (var i = 0; i < data_tmp.length; i++) {
    var tmp = data_tmp[i].split('=');
    if (tmp.length < 2) continue;
    var val = decodeURIComponent(tmp[1].replace(/\+/g, '%20'));
    if (val.length > 3) {
      form_info[tmp[0]] = 'BT-CRT' + aes_encrypt(val, pwd);
    } else {
      form_info[tmp[0]] = val;
    }

  }
  return $.param(form_info);
}

function ajax_encrypt (request) {
  if (!this.type || !this.data || !this.contentType) return;
  if ($("#panel_debug").attr("data") == 'True') return;
  if ($("#panel_debug").attr("data-pyversion") == '2') return;
  if (this.type == 'POST' && this.data.length > 1) {
    this.data = format_form_data(this.data);
  }
}

var gl_error_body = '';
function ajaxSetup () {
  var my_headers = {};
  var request_token_ele = document.getElementById("request_token_head");
  if (request_token_ele) {
    var request_token = request_token_ele.getAttribute('token');
    if (request_token) {
      my_headers['x-http-token'] = request_token
    }
  }
  request_token_cookie = getCookie('request_token');
  if (request_token_cookie) {
    my_headers['x-cookie-token'] = request_token_cookie
  }

  if (my_headers) {
    $.ajaxSetup({
      headers: my_headers,
      error: function (jqXHR, textStatus, errorThrown) {
        var pro = parseInt(bt.get_cookie('pro_end') || -1);
        var ltd = parseInt(bt.get_cookie('ltd_end')  || -1);
        isBuy = false;
        if(pro == 0 || ltd > 0) isBuy = true   //??????

        if (!jqXHR.responseText) return;
        //??????????????????????????????????????????
        if (typeof (jqXHR.responseText) == 'string') {
          if ((jqXHR.responseText.indexOf('/static/favicon.ico') != -1 && jqXHR.responseText.indexOf('/static/img/qrCode.png') != -1) || jqXHR.responseText.indexOf('<!DOCTYPE html>') === 0) {
            window.location.href = "/login"
            return
          }
        }
        if (typeof (String.prototype.trim) === "undefined") {
          String.prototype.trim = function () {
            return String(this).replace(/^\s+|\s+$/g, '');
          };
        }

        error_key = 'We need to make sure this has a favicon so that the debugger does';
        error_find = jqXHR.responseText.indexOf(error_key)
        gl_error_body = jqXHR.responseText;
        if (jqXHR.status == 500 && jqXHR.responseText.indexOf('?????????????????????') != -1) {
          if (jqXHR.responseText.indexOf('????????????????????????!') != -1) {
            if ($('.libLogin').length > 0 || $('.radio_account_view').length > 0) return false;
            bt.pub.bind_btname(function () {
              window.location.reload();
            });
            return;
          }
          if (jqXHR.responseText.indexOf('?????????????????????????????????????????????') != -1){
            error_msg = jqXHR.responseText.split('Error: ')[1].split("</pre>")[0].replace("???????????????????????????:",'').replace("public.PanelError:",'').trim();
          }else{
            error_msg = '<h3>' + jqXHR.responseText.split('<h3>')[1].split('</h3>')[0] + '</h3>'
            error_msg += '<a style="color:dimgrey;font-size:none">' + jqXHR.responseText.split('<h4 style="font-size: none;">')[1].split("</h4>")[0].replace("???????????????????????????:",'').replace("public.PanelError:",'').trim() + '</a>';
          }
          
          error_msg += "<br><a class='btlink' onclick='show_error_message()'> >>??????????????????</a>"+(isBuy?"<span class='ml33'><span class='wechatEnterpriseService' style='vertical-align: middle;'></span><span class='btlink error_kefu_consult'>????????????</span>":'')+"</span>";
        }else if(jqXHR.responseText != 'Internal Server Error'){
          show_error_message()
          return false
        }else{return false}
        $(".layui-layer-padding").parents('.layer-anim').remove();
        $(".layui-layer-shade").remove();
        setTimeout(function () {
          layer.open({
            title: false,
            content: error_msg,
            closeBtn: 2,
            btn: false,
            shadeClose: false,
            shade: 0.3,
            icon:2,
            area:"600px",
            success: function () {
              $('pre').scrollTop(100000000000)

              $('.error_kefu_consult').click(function(){wechatKefuConsult()})
              // ????????????   ???????????????????????????
              function wechatKefuConsult(){
                layer.open({
                  type: 1,
                  area: ['300px', '290px'],
                  title: false,
                  closeBtn: 2,
                  shift: 0,
                  content: '<div class="service_consult">\
                        <div class="service_consult_title">???????????????"?????????"</div>\
                        <div class="contact_consult" style="margin-bottom: 5px;"><div id="contact_consult_qcode"></div><i class="wechatEnterprise"></i></div>\
                        <div>??????????????????</div>\
                        <ul class="c7" style="margin-top:22px;text-align: center;">\
                            <li>???????????????9:15 - 18:00</li>\
                        </ul>\
                    </div>',
                  success:function(){
                    $('#contact_consult_qcode').qrcode({
                      render: "canvas",
                      width: 140,
                      height: 140,
                      text:'https://work.weixin.qq.com/kfid/kfcc6f97f50f727a020'
                    });
                  }
                })
              }
            }
          });
        }, 100)
      }
    });
  }
}
ajaxSetup();


function show_error_message() {
  var error_body
  if (error_find != -1) {
    error_body = gl_error_body.split('<!--')[2].replace('-->', '')
    var tmp = error_body.split('During handling of the above exception, another exception occurred:')
    error_body = tmp[tmp.length - 1];
    error_msg = '<div>\
      <h3 style="margin-bottom: 10px;">??????????????????????????????????????????</h3>\
      <pre style="height:435px;word-wrap: break-word;white-space: pre-wrap;margin: 0 0 0px">' + error_body.trim() + '</pre>\
      <ul class="help-info-text err_project_ul" style="display:inline-block">\
        <li style="list-style: none;"><b>????????????????????????????????????????????????????????????????????????????????????????????????</b></li>\
        <li style="list-style: none;">?????????????????????[??????]????????????????????????????????????????????????????????????</li>\
        <li style="list-style: none;">??????????????????????????????????????????????????????????????????, ???????????????<a class="btlink" href="https://www.bt.cn/bbs" target="_blank">https://www.bt.cn/bbs</a></li>\
        <li style="list-style: none;display:'+(isBuy?'block':'none')+'">???????????????(<span style="color:#ff7300">??????</span>)????????????????????????????????????????????????????????????</li>\
      </ul>\
      <div style="position: relative;margin-top: 20px;margin-right: 40px;text-align: center;font-size: 12px;display:'+(isBuy?'block':'none')+'" class="pull-right">\
        <span id="err_kefu_img" style="padding: 5px;border: 1px solid #20a53a;display: inline-block;height: 113px;"></span>\
        <i class="wechatEnterprise" style="position: absolute;top: 44px;left: 44px;"></i>\
        <div>??????????????????</div>\
      </div>\
    </div>'
    $(".layui-layer-padding").parents('.layer-anim').remove();
    $(".layui-layer-shade").remove();
  }else{
    error_msg = gl_error_body
  }

  setTimeout(function () {
    layer.open({
      title: false,
      content: error_msg,
      closeBtn: 2,
      area: ["1200px", (error_find != -1?(isBuy?"670px":"625px"):(isBuy?"750px":"720px"))],
      btn: false,
      shadeClose: false,
      shade: 0.3,
      success: function () {
        $('pre').scrollTop(100000000000)
        $('.err_project_ul li').css('line-height','32px')
        if(isBuy) $('.consult_project').show()
        $('#err_kefu_img').qrcode({
          render: "canvas",
          width: 100,
          height: 100,
          text:'https://work.weixin.qq.com/kfid/kfcc6f97f50f727a020'
        });
      }
    });
  }, 100)
}


function show_error_message() {
    if (error_find != -1) {
        var error_body = gl_error_body.split('<!--')[2].replace('-->', '')
        var tmp = error_body.split('During handling of the above exception, another exception occurred:')
        error_body = tmp[tmp.length - 1];
        var error_msg = '<div>\
        <h3 style="margin-bottom: 10px;">??????????????????????????????????????????</h3>\
        <pre style="height:635px;word-wrap: break-word;white-space: pre-wrap;margin: 0 0 0px">'+ error_body.trim() + '</pre>\
        <ul class="help-info-text">\
          <li style="list-style: none;"><b>????????????????????????????????????????????????????????????????????????????????????????????????</b></li>\
          <li style="list-style: none;">1??????[??????]????????????????????????????????????????????????????????????</li>\
          <li style="list-style: none;">2?????????????????????????????????????????????????????????????????????????????????????????????, ???????????????<a class="btlink" href="https://www.bt.cn/bbs" target="_blank">https://www.bt.cn/bbs</a></li>\
        </ul>\
      </div>'

    } else {
        var error_msg = gl_error_body;
    }
    $(".layui-layer-padding").parents('.layer-anim').remove();
    $(".layui-layer-shade").remove();
    setTimeout(function () {
      layer.open({
        title: false,
        content: error_msg,
        closeBtn: 2,
        area: ["1200px", "810px"],
        btn: false,
        shadeClose: false,
        shade: 0.3,
        success: function () {
          $('pre').scrollTop(100000000000)
        }
      });
    }, 100)
}

function RandomStrPwd (b) {
  b = b || 32;
  var c = "AaBbCcDdEeFfGHhiJjKkLMmNnPpRSrTsWtXwYxZyz2345678";
  var a = c.length;
  while (true) {
    var d = "";
    for (i = 0; i < b; i++) {
      d += c.charAt(Math.floor(Math.random() * a))
    }

    if (/^(?:(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]))/.test(d)) {
      return d;
    }
  }
}

function repeatPwd (a) {
  $("#MyPassword").val(RandomStrPwd(a))
}

function refresh () {
  window.location.reload()
}

function GetBakPost (b) {
  $(".baktext").hide().prev().show();
  var c = $(".baktext").attr("data-id");
  var a = $(".baktext").val();
  if (a == "") {
    a = lan.bt.empty;
  }
  setWebPs(b, c, a);
  $("a[data-id='" + c + "']").html(a);
  $(".baktext").remove()
}

function setWebPs (b, e, a) {
  var d = layer.load({
    shade: true,
    shadeClose: false
  });
  var c = "ps=" + a;
  $.post("/data?action=setPs", "table=" + b + "&id=" + e + "&" + c, function (f) {
    if (f == true) {
      if (b == "sites") {
        getWeb(1)
      } else {
        if (b == "ftps") {
          getFtp(1)
        } else {
          getData(1)
        }
      }
      layer.closeAll();
      layer.msg(lan.public.edit_ok, {
        icon: 1
      });
    } else {
      layer.msg(lan.public.edit_err, {
        icon: 2
      });
      layer.closeAll();
    }
  });
}

$(".menu-icon").click(function () {
  $(".sidebar-scroll").toggleClass("sidebar-close");
  $(".main-content").toggleClass("main-content-open");
  if ($(".sidebar-close")) {
    $(".sub-menu").find(".sub").css("display", "none")
  }
});
var Upload, percentage;

Date.prototype.format = function (b) {
  var c = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    S: this.getMilliseconds()
  };
  if (/(y+)/.test(b)) {
    b = b.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
  }
  for (var a in c) {
    if (new RegExp("(" + a + ")").test(b)) {
      b = b.replace(RegExp.$1, RegExp.$1.length == 1 ? c[a] : ("00" + c[a]).substr(("" + c[a]).length))
    }
  }
  return b
};

function getLocalTime (a) {
  a = a.toString();
  if (a.length > 10) {
    a = a.substring(0, 10)
  }
  return new Date(parseInt(a) * 1000).format("yyyy/MM/dd hh:mm:ss")
}

function ToSize (a) {
  var d = [" B", " KB", " MB", " GB", " TB", " PB"];
  var e = 1024;
  for (var b = 0; b < d.length; b++) {
    if (a < e) {
      return (b == 0 ? a : a.toFixed(2)) + d[b]
    }
    a /= e
  }
}


function ChangePath (d) {
  setCookie("SetId", d);
  setCookie("SetName", "");
  var c = layer.open({
    type: 1,
    area: "650px",
    title: lan.bt.dir,
    closeBtn: 2,
    shift: 5,
    shadeClose: false,
    content: "<div class='changepath'><div class='path-top'><button type='button' class='btn btn-default btn-sm' onclick='BackFile()'><span class='glyphicon glyphicon-share-alt'></span> " + lan.public.return + "</button><div class='place' id='PathPlace'>" + lan.bt.path + "???<span></span></div></div><div class='path-con'><div class='path-con-left'><dl><dt id='changecomlist' onclick='BackMyComputer()'>" + lan.bt.comp + "</dt></dl></div><div class='path-con-right'><ul class='default' id='computerDefautl'></ul><div class='file-list divtable'><table class='table table-hover' style='border:0 none'><thead><tr class='file-list-head'><th width='40%'>" + lan.bt.filename + "</th><th width='20%'>" + lan.bt.etime + "</th><th width='10%'>" + lan.bt.access + "</th><th width='10%'>" + lan.bt.own + "</th><th width='10%'></th></tr></thead><tbody id='tbody' class='list-list'></tbody></table></div></div></div></div><div class='getfile-btn' style='margin-top:0'><button type='button' class='btn btn-default btn-sm pull-left' onclick='CreateFolder()'>" + lan.bt.adddir + "</button><button type='button' class='btn btn-danger btn-sm mr5' onclick=\"layer.close(getCookie('ChangePath'))\">" + lan.public.close + "</button> <button type='button' class='btn btn-success btn-sm' onclick='GetfilePath()'>" + lan.bt.path_ok + "</button></div>"
  });
  setCookie("ChangePath", c);
  var b = $("#" + d).val();
  tmp = b.split(".");
  // if (tmp[tmp.length - 1] == "gz") {
    tmp = b.split("/");
    b = "";
    for (var a = 0; a < tmp.length - 1; a++) {
      b += "/" + tmp[a]
    }
    setCookie("SetName", tmp[tmp.length - 1])
  // }
  b = b.replace(/\/\//g, "/");
  GetDiskList(b);
  ActiveDisk()
}

function GetDiskList (b) {
  var d = "";
  var a = "";
  var c = "path=" + b + "&disk=True&showRow=500";
  $.post("/files?action=GetDir", c, function (h) {
    if (h.DISK != undefined) {
      for (var f = 0; f < h.DISK.length; f++) {
        a += "<dd onclick=\"GetDiskList('" + h.DISK[f].path + "')\"><span class='glyphicon glyphicon-hdd'></span>&nbsp;<span>" + h.DISK[f].path + "</span></div></dd>"
      }
      $("#changecomlist").html(a)
    }
    for (var f = 0; f < h.DIR.length; f++) {
      var g = h.DIR[f].split(";");
      var e = g[0];
      if (e.length > 20) {
        e = e.substring(0, 20) + "..."
      }
      if (isChineseChar(e)) {
        if (e.length > 10) {
          e = e.substring(0, 10) + "..."
        }
      }
      d += "<tr><td onclick=\"GetDiskList('" + h.PATH + "/" + g[0] + "')\" title='" + g[0] + "'><span class='glyphicon glyphicon-folder-open'></span>" + e + "</td><td>" + getLocalTime(g[2]) + "</td><td>" + g[3] + "</td><td>" + g[4] + "</td><td><span class='delfile-btn' onclick=\"NewDelFile('" + h.PATH + "/" + g[0] + "')\">X</span></td></tr>"
    }
    if (h.FILES != null && h.FILES != "") {
      for (var f = 0; f < h.FILES.length; f++) {
        var g = h.FILES[f].split(";");
        var e = g[0];
        if (e.length > 20) {
          e = e.substring(0, 20) + "..."
        }
        if (isChineseChar(e)) {
          if (e.length > 10) {
            e = e.substring(0, 10) + "..."
          }
        }
        d += "<tr><td title='" + g[0] + "'><span class='glyphicon glyphicon-file'></span><span>" + e + "</span></td><td>" + getLocalTime(g[2]) + "</td><td>" + g[3] + "</td><td>" + g[4] + "</td><td></td></tr>"
      }
    }
    $(".default").hide();
    $(".file-list").show();
    $("#tbody").html(d);
    if (h.PATH.substr(h.PATH.length - 1, 1) != "/") {
      h.PATH += "/"
    }
    $("#PathPlace").find("span").html(h.PATH);
    ActiveDisk();
    return
  })
}

function CreateFolder () {
  var a = "<tr><td colspan='2'><span class='glyphicon glyphicon-folder-open'></span> <input id='newFolderName' class='newFolderName' type='text' value=''></td><td colspan='3'><button id='nameOk' type='button' class='btn btn-success btn-sm'>" + lan.public.ok + "</button>&nbsp;&nbsp;<button id='nameNOk' type='button' class='btn btn-default btn-sm'>" + lan.public.cancel + "</button></td></tr>";
  if ($("#tbody tr").length == 0) {
    $("#tbody").append(a)
  } else {
    $("#tbody tr:first-child").before(a)
  }
  $(".newFolderName").focus();
  $("#nameOk").click(function () {
    var c = $("#newFolderName").val();
    var b = $("#PathPlace").find("span").text();
    newTxt = b.replace(new RegExp(/(\/\/)/g), "/") + c;
    var d = "path=" + newTxt;
    $.post("/files?action=CreateDir", d, function (e) {
      if (e.status == true) {
        layer.msg(e.msg, {
          icon: 1
        })
      } else {
        layer.msg(e.msg, {
          icon: 2
        })
      }
      GetDiskList(b)
    })
  });
  $("#nameNOk").click(function () {
    $(this).parents("tr").remove()
  })
}

function NewDelFile (c) {
  var a = $("#PathPlace").find("span").text();
  newTxt = c.replace(new RegExp(/(\/\/)/g), "/");
  var b = "path=" + newTxt + "&empty=True";
  $.post("/files?action=DeleteDir", b, function (d) {
    if (d.status == true) {
      layer.msg(d.msg, {
        icon: 1
      })
    } else {
      layer.msg(d.msg, {
        icon: 2
      })
    }
    this.get_file_list(a);
  })
}

function ActiveDisk () {
  var a = $("#PathPlace").find("span").text().substring(0, 1);
  switch (a) {
    case "C":
      $(".path-con-left dd:nth-of-type(1)").css("background", "#eee").siblings().removeAttr("style");
      break;
    case "D":
      $(".path-con-left dd:nth-of-type(2)").css("background", "#eee").siblings().removeAttr("style");
      break;
    case "E":
      $(".path-con-left dd:nth-of-type(3)").css("background", "#eee").siblings().removeAttr("style");
      break;
    case "F":
      $(".path-con-left dd:nth-of-type(4)").css("background", "#eee").siblings().removeAttr("style");
      break;
    case "G":
      $(".path-con-left dd:nth-of-type(5)").css("background", "#eee").siblings().removeAttr("style");
      break;
    case "H":
      $(".path-con-left dd:nth-of-type(6)").css("background", "#eee").siblings().removeAttr("style");
      break;
    default:
      $(".path-con-left dd").removeAttr("style")
  }
}

function BackMyComputer () {
  $(".default").show();
  $(".file-list").hide();
  $("#PathPlace").find("span").html("");
  ActiveDisk()
}

function BackFile () {
  var c = $("#PathPlace").find("span").text();
  if (c.substr(c.length - 1, 1) == "/") {
    c = c.substr(0, c.length - 1)
  }
  var d = c.split("/");
  var a = "";
  if (d.length > 1) {
    var e = d.length - 1;
    for (var b = 0; b < e; b++) {
      a += d[b] + "/"
    }
    GetDiskList(a.replace("//", "/"))
  } else {
    a = d[0]
  }
  if (d.length == 1) { }
}

function GetfilePath () {
  var a = $("#PathPlace").find("span").text();
  a = a.replace(new RegExp(/(\\)/g), "/");
  setCookie('path_dir_change', a);
  $("#" + getCookie("SetId")).val(a + getCookie("SetName"));
  layer.close(getCookie("ChangePath"))
}

function setCookie (a, c) {
  var b = 30;
  var d = new Date();
  d.setTime(d.getTime() + b * 24 * 60 * 60 * 1000);
  var is_https = window.location.protocol == 'https:'
  var samesite = ';Secure; Path=/; SameSite=None'
  document.cookie = a + "=" + escape(c) + ";expires=" + d.toGMTString() + (is_https ? samesite : '')
}

function getCookie (b) {
  var a, c = new RegExp("(^| )" + b + "=([^;]*)(;|$)");
  if (a = document.cookie.match(c)) {
    return unescape(a[2])
  } else {
    return null
  }
}

function aotuHeight () {
  var a = $("body").height() - 50;
  $(".main-content").css("min-height", a)
}
$(function () {
  aotuHeight()
});
$(window).resize(function () {
  aotuHeight()
});

function showHidePwd () {
  var a = "glyphicon-eye-open",
    b = "glyphicon-eye-close";
  $(".pw-ico").click(function () {
    var g = $(this).attr("class"),
      e = $(this).prev();
    if (g.indexOf(a) > 0) {
      var h = e.attr("data-pw");
      $(this).removeClass(a).addClass(b);
      e.text(h)
    } else {
      $(this).removeClass(b).addClass(a);
      e.text("**********")
    }
    var d = $(this).next().position().left;
    var f = $(this).next().position().top;
    var c = $(this).next().width();
    $(this).next().next().css({
      left: d + c + "px",
      top: f + "px"
    })
  })
}

function openPath (a) {
  setCookie("Path", a);
  window.location.href = "/files"
}

function OnlineEditFile (k, f) {
  if (k != 0) {
    var l = $("#PathPlace input").val();
    var h = encodeURIComponent($("#textBody").val());
    var a = $("select[name=encoding]").val();
    var loadT = layer.msg(lan.bt.save_file, {
      icon: 16,
      time: 0
    });
    $.post("/files?action=SaveFileBody", "data=" + h + "&path=" + encodeURIComponent(f) + "&encoding=" + a, function (m) {
      if (k == 1) {
        layer.close(loadT);
      }
      layer.msg(m.msg, {
        icon: m.status ? 1 : 2
      });
    });
    return
  }
  var e = layer.msg(lan.bt.read_file, {
    icon: 16,
    time: 0
  });
  var g = f.split(".");
  var b = g[g.length - 1];
  var d;
  switch (b) {
    case "html":
      var j = {
        name: "htmlmixed",
        scriptTypes: [{
          matches: /\/x-handlebars-template|\/x-mustache/i,
          mode: null
        }, {
          matches: /(text|application)\/(x-)?vb(a|script)/i,
          mode: "vbscript"
        }]
      };
      d = j;
      break;
    case "htm":
      var j = {
        name: "htmlmixed",
        scriptTypes: [{
          matches: /\/x-handlebars-template|\/x-mustache/i,
          mode: null
        }, {
          matches: /(text|application)\/(x-)?vb(a|script)/i,
          mode: "vbscript"
        }]
      };
      d = j;
      break;
    case "js":
      d = "text/javascript";
      break;
    case "json":
      d = "application/ld+json";
      break;
    case "css":
      d = "text/css";
      break;
    case "php":
      d = "application/x-httpd-php";
      break;
    case "tpl":
      d = "application/x-httpd-php";
      break;
    case "xml":
      d = "application/xml";
      break;
    case "sql":
      d = "text/x-sql";
      break;
    case "conf":
      d = "text/x-nginx-conf";
      break;
    default:
      var j = {
        name: "htmlmixed",
        scriptTypes: [{
          matches: /\/x-handlebars-template|\/x-mustache/i,
          mode: null
        }, {
          matches: /(text|application)\/(x-)?vb(a|script)/i,
          mode: "vbscript"
        }]
      };
      d = j
  }
  $.post("/files?action=GetFileBody", "path=" + encodeURIComponent(f), function (s) {
    if (s.status === false) {
      layer.msg(s.msg, { icon: 5 });
      return;
    }
    layer.close(e);
    var u = ["utf-8", "GBK", "GB2312", "BIG5"];
    var n = "";
    var m = "";
    var o = "";
    for (var p = 0; p < u.length; p++) {
      m = s.encoding == u[p] ? "selected" : "";
      n += '<option value="' + u[p] + '" ' + m + ">" + u[p] + "</option>"
    }
    var r = layer.open({
      type: 1,
      shift: 5,
      closeBtn: 2,
      area: ["90%", "90%"],
      title: lan.bt.edit_title + "[" + f + "]",
      content: '<form class="bt-form pd20 pb70"><div class="line"><p style="color:red;margin-bottom:10px">' + lan.bt.edit_ps + '			<select class="bt-input-text" name="encoding" style="width: 74px;position: absolute;top: 31px;right: 19px;height: 22px;z-index: 9999;border-radius: 0;">' + n + '</select></p><textarea class="mCustomScrollbar bt-input-text" id="textBody" style="width:100%;margin:0 auto;line-height: 1.8;position: relative;top: 10px;" value="" />			</div>			<div class="bt-form-submit-btn" style="position:absolute; bottom:0; width:100%">			<button type="button" class="btn btn-danger btn-sm btn-editor-close">' + lan.public.close + '</button>			<button id="OnlineEditFileBtn" type="button" class="btn btn-success btn-sm">' + lan.public.save + '</button>			</div>			</form>'
    });
    $("#textBody").text(s.data);
    var q = $(window).height() * 0.9;
    $("#textBody").height(q - 160);
    var t = CodeMirror.fromTextArea(document.getElementById("textBody"), {
      extraKeys: {
        "Ctrl-F": "findPersistent",
        "Ctrl-H": "replaceAll",
        "Ctrl-S": function () {
          $("#textBody").text(t.getValue());
          OnlineEditFile(2, f)
        }
      },
      mode: d,
      lineNumbers: true,
      matchBrackets: true,
      matchtags: true,
      autoMatchParens: true
    });
    t.focus();
    t.setSize("auto", q - 150);
    $("#OnlineEditFileBtn").click(function () {
      $("#textBody").text(t.getValue());
      OnlineEditFile(1, f);
    });
    $(".btn-editor-close").click(function () {
      layer.close(r);
    });
  });
}

function ServiceAdmin (a, b) {
  if (!isNaN(a)) {
    a = "php-fpm-" + a
  }
  a = a.replace('_soft', '');
  var c = "name=" + a + "&type=" + b;
  var d = "";

  switch (b) {
    case "stop":
      d = lan.bt.stop;
      break;
    case "start":
      d = lan.bt.start;
      break;
    case "restart":
      d = lan.bt.restart;
      break;
    case "reload":
      d = lan.bt.reload;
      break
  }
  layer.confirm(lan.get('service_confirm', [d, a]), {
    icon: 3,
    closeBtn: 2
  }, function () {
    var e = layer.msg(lan.get('service_the', [d, a]), {
      icon: 16,
      time: 0
    });
    $.post("/system?action=ServiceAdmin", c, function (g) {
      layer.close(e);

      var f = g.status ? lan.get('service_ok', [a, d]) : lan.get('service_err', [a, d]);
      layer.msg(f, {
        icon: g.status ? 1 : 2
      });
      if (b != "reload" && g.status == true) {
        setTimeout(function () {
          window.location.reload()
        }, 1000)
      }
      if (!g.status) {
        layer.msg(g.msg, {
          icon: 2,
          time: 0,
          shade: 0.3,
          shadeClose: true
        })
      }
    }).error(function () {
      layer.close(e);
      layer.msg(lan.public.success, {
        icon: 1
      })
    })
  })
}

function GetConfigFile (a) {
  var b = "";
  switch (a) {
    case "mysql":
      b = "/etc/my.cnf";
      break;
    case "nginx":
      b = "/www/server/nginx/conf/nginx.conf";
      break;
    case "pure-ftpd":
      b = "/www/server/pure-ftpd/etc/pure-ftpd.conf";
      break;
    case "apache":
      b = "/www/server/apache/conf/httpd.conf";
      break;
    case "tomcat":
      b = "/www/server/tomcat/conf/server.xml";
      break;
    default:
      b = "/www/server/php/" + a + "/etc/php.ini";
      break
  }
  OnlineEditFile(0, b)
}

function GetPHPStatus (a) {
  if (a == "52") {
    layer.msg(lan.bt.php_status_err, {
      icon: 2
    });
    return
  }
  $.post("/ajax?action=GetPHPStatus", "version=" + a, function (b) {
    layer.open({
      type: 1,
      area: "400",
      title: lan.bt.php_status_title,
      closeBtn: 2,
      shift: 5,
      shadeClose: true,
      content: "<div style='margin:15px;'><table class='table table-hover table-bordered'>						<tr><th>" + lan.bt.php_pool + "</th><td>" + b.pool + "</td></tr>						<tr><th>" + lan.bt.php_manager + "</th><td>" + ((b["process manager"] == "dynamic") ? lan.bt.dynamic : lan.bt.static) + "</td></tr>						<tr><th>" + lan.bt.php_start + "</th><td>" + b["start time"] + "</td></tr>						<tr><th>" + lan.bt.php_accepted + "</th><td>" + b["accepted conn"] + "</td></tr>						<tr><th>" + lan.bt.php_queue + "</th><td>" + b["listen queue"] + "</td></tr>						<tr><th>" + lan.bt.php_max_queue + "</th><td>" + b["max listen queue"] + "</td></tr>						<tr><th>" + lan.bt.php_len_queue + "</th><td>" + b["listen queue len"] + "</td></tr>						<tr><th>" + lan.bt.php_idle + "</th><td>" + b["idle processes"] + "</td></tr>						<tr><th>" + lan.bt.php_active + "</th><td>" + b["active processes"] + "</td></tr>						<tr><th>" + lan.bt.php_total + "</th><td>" + b["total processes"] + "</td></tr>						<tr><th>" + lan.bt.php_max_active + "</th><td>" + b["max active processes"] + "</td></tr>						<tr><th>" + lan.bt.php_max_children + "</th><td>" + b["max children reached"] + "</td></tr>						<tr><th>" + lan.bt.php_slow + "</th><td>" + b["slow requests"] + "</td></tr>					 </table></div>"
    })
  })
}

function GetNginxStatus () {
  $.post("/ajax?action=GetNginxStatus", "", function (a) {
    layer.open({
      type: 1,
      area: "400",
      title: lan.bt.nginx_title,
      closeBtn: 2,
      shift: 5,
      shadeClose: true,
      content: "<div style='margin:15px;'><table class='table table-hover table-bordered'>						<tr><th>" + lan.bt.nginx_active + "</th><td>" + a.active + "</td></tr>						<tr><th>" + lan.bt.nginx_accepts + "</th><td>" + a.accepts + "</td></tr>						<tr><th>" + lan.bt.nginx_handled + "</th><td>" + a.handled + "</td></tr>						<tr><th>" + lan.bt.nginx_requests + "</th><td>" + a.requests + "</td></tr>						<tr><th>" + lan.bt.nginx_reading + "</th><td>" + a.Reading + "</td></tr>						<tr><th>" + lan.bt.nginx_writing + "</th><td>" + a.Writing + "</td></tr>						<tr><th>" + lan.bt.nginx_waiting + "</th><td>" + a.Waiting + "</td></tr>					 </table></div>"
    })
  })
}

function divcenter () {
  $(".layui-layer").css("position", "absolute");
  var c = $(window).width();
  var b = $(".layui-layer").outerWidth();
  var g = $(window).height();
  var f = $(".layui-layer").outerHeight();
  var a = (c - b) / 2;
  var e = (g - f) / 2 > 0 ? (g - f) / 2 : 10;
  var d = $(".layui-layer").offset().left - $(".layui-layer").position().left;
  var h = $(".layui-layer").offset().top - $(".layui-layer").position().top;
  a = a + $(window).scrollLeft() - d;
  e = e + $(window).scrollTop() - h;
  $(".layui-layer").css("left", a + "px");
  $(".layui-layer").css("top", e + "px")
}

function isChineseChar (b) {
  var a = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
  return a.test(b)
}

function SafeMessage (j, h, g, f) {
  if (f == undefined) {
    f = ""
  }
  var d = Math.round(Math.random() * 9 + 1);
  var c = Math.round(Math.random() * 9 + 1);
  var e = "";
  e = d + c;
  sumtext = d + " + " + c;
  setCookie("vcodesum", e);
  var mess = layer.open({
    type: 1,
    title: j,
    area: "350px",
    closeBtn: 2,
    shadeClose: true,
    content: "<div class='bt-form webDelete pd20 pb70'><p>" + h + "</p>" + f + "<div class='vcode'>" + lan.bt.cal_msg + "<span class='text'>" + sumtext + "</span>=<input type='number' id='vcodeResult' value=''></div><div class='bt-form-submit-btn'><button type='button' class='btn btn-danger btn-sm bt-cancel'>" + lan.public.cancel + "</button> <button type='button' id='toSubmit' class='btn btn-success btn-sm' >" + lan.public.ok + "</button></div></div>"
  });
  $("#vcodeResult").focus().keyup(function (a) {
    if (a.keyCode == 13) {
      $("#toSubmit").click()
    }
  });
  $(".bt-cancel").click(function () {
    layer.close(mess);
  });
  $("#toSubmit").click(function () {
    var a = $("#vcodeResult").val().replace(/ /g, "");
    if (a == undefined || a == "") {
      layer.msg('???????????????????????????!');
      return
    }
    if (a != getCookie("vcodesum")) {
      layer.msg('???????????????????????????!');
      return
    }
    layer.close(mess);
    g();
  })
}

$(function () {
  $(".fb-ico").hover(function () {
    $(".fb-text").css({
      left: "36px",
      top: 0,
      width: "80px"
    })
  }, function () {
    $(".fb-text").css({
      left: 0,
      width: "36px"
    })
  }).click(function () {
    $(".fb-text").css({
      left: 0,
      width: "36px"
    });
    $(".zun-feedback-suggestion").show()
  });
  $(".fb-close").click(function () {
    $(".zun-feedback-suggestion").hide()
  });
  $(".fb-attitudes li").click(function () {
    $(this).addClass("fb-selected").siblings().removeClass("fb-selected")
  })
});
$("#dologin").click(function () {
  layer.confirm(lan.bt.loginout, {
    icon: 3,
    closeBtn: 2
  }, function () {
    window.location.href = "/login?dologin=True";
  });
  return false
});

function setPassword (a) {
  if (a == 1) {
    p1 = $("#p1").val();
    p2 = $("#p2").val();
    if (p1 == "" || p1.length < 8) {
      layer.msg(lan.bt.pass_err_len, {
        icon: 2
      });
      return
    }

    //???????????????????????????
    var checks = ['admin888', '123123123', '12345678', '45678910', '87654321', 'asdfghjkl', 'password', 'qwerqwer'];
    pchecks = 'abcdefghijklmnopqrstuvwxyz1234567890';
    for (var i = 0; i < pchecks.length; i++) {
      checks.push(pchecks[i] + pchecks[i] + pchecks[i] + pchecks[i] + pchecks[i] + pchecks[i] + pchecks[i] + pchecks[i]);
    }

    //???????????????
    cps = p1.toLowerCase();
    var isError = "";
    for (var i = 0; i < checks.length; i++) {
      if (cps == checks[i]) {
        isError += '[' + checks[i] + '] ';
      }
    }

    if (isError != "") {
      layer.msg(lan.bt.pass_err + isError, { icon: 5 });
      return;
    }


    if (p1 != p2) {
      layer.msg(lan.bt.pass_err_re, {
        icon: 2
      });
      return
    }
    $.post("/config?action=setPassword", "password1=" + encodeURIComponent(p1) + "&password2=" + encodeURIComponent(p2), function (b) {
      if (b.status) {
        layer.closeAll();
        layer.msg(b.msg, {
          icon: 1,
          time: 1000
        }, function () {
          window.location.href = '/login?dologin=True';
        })
      } else {
        layer.msg(b.msg, {
          icon: 2
        })
      }
    });
    return
  }
  layer.open({
    type: 1,
    area: "290px",
    title: lan.bt.pass_title,
    closeBtn: 2,
    shift: 5,
    shadeClose: false,
    content: "<div class='bt-form pd20 pb70'><div class='line'><span class='tname'>" + lan.public.pass + "</span><div class='info-r'><input class='bt-input-text' type='text' name='password1' id='p1' value='' placeholder='" + lan.bt.pass_new_title + "' style='width:100%'/></div></div><div class='line'><span class='tname'>" + lan.bt.pass_re + "</span><div class='info-r'><input class='bt-input-text' type='text' name='password2' id='p2' value='' placeholder='" + lan.bt.pass_re_title + "' style='width:100%' /></div></div><div class='bt-form-submit-btn'><span style='float: left;' title='" + lan.bt.pass_rep + "' class='btn btn-default btn-sm' onclick='randPwd(10)'>" + lan.bt.pass_rep_btn + "</span><button type='button' class='btn btn-danger btn-sm' onclick=\"layer.closeAll()\">" + lan.public.close + "</button> <button type='button' class='btn btn-success btn-sm' onclick=\"setPassword(1)\">" + lan.public.edit + "</button></div></div>"
  });
}


function randPwd (len) {
  if (len == undefined) len = 12;
  var pwd = RandomStrPwd(len);
  $("#p1").val(pwd);
  $("#p2").val(pwd);
  layer.msg(lan.bt.pass_rep_ps, { time: 2000 })
}

function setUserName (a) {
  if (a == 1) {
    p1 = $("#p1").val();
    p2 = $("#p2").val();
    if (p1 == "" || p1.length < 3) {
      layer.msg(lan.bt.user_len, {
        icon: 2
      });
      return
    }
    if (p1 != p2) {
      layer.msg(lan.bt.user_err_re, {
        icon: 2
      });
      return
    }
    var checks = ['admin', 'root', 'admin123', '123456'];

    if ($.inArray(p1, checks) >= 0) {
      layer.msg('???????????????????????????', {
        icon: 2
      });
      return;
    }

    $.post("/config?action=setUsername", "username1=" + encodeURIComponent(p1) + "&username2=" + encodeURIComponent(p2), function (b) {
      if (b.status) {
        layer.closeAll();
        layer.msg(b.msg, {
          icon: 1,
          time: 1000
        }, function () {
          window.location.href = '/login?dologin=True';
        });
        $("input[name='username_']").val(p1)
      } else {
        layer.msg(b.msg, {
          icon: 2
        })
      }
    });
    return
  }
  layer.open({
    type: 1,
    area: "290px",
    title: lan.bt.user_title,
    closeBtn: 2,
    shift: 5,
    shadeClose: false,
    content: "<div class='bt-form pd20 pb70'><div class='line'><span class='tname'>" + lan.bt.user + "</span><div class='info-r'><input class='bt-input-text' type='text' name='password1' id='p1' value='' placeholder='" + lan.bt.user_new + "' style='width:100%'/></div></div><div class='line'><span class='tname'>" + lan.bt.pass_re + "</span><div class='info-r'><input class='bt-input-text' type='text' name='password2' id='p2' value='' placeholder='" + lan.bt.pass_re_title + "' style='width:100%'/></div></div><div class='bt-form-submit-btn'><button type='button' class='btn btn-danger btn-sm' onclick=\"layer.closeAll()\">" + lan.public.close + "</button> <button type='button' class='btn btn-success btn-sm' onclick=\"setUserName(1)\">" + lan.public.edit + "</button></div></div>"
  })
}
var openWindow = null;
var downLoad = null;
var speed = null;

function task () {
  messagebox();
}

function ActionTask () {
  var a = layer.msg(lan.public.the_del, {
    icon: 16,
    time: 0,
    shade: [0.3, "#000"]
  });
  $.post("/files?action=ActionTask", "", function (b) {
    layer.close(a);
    layer.msg(b.msg, {
      icon: b.status ? 1 : 5
    })
  })
}

function RemoveTask (id) {
  var loadT = bt.load(lan.public.the_del);
  bt.send('RemoveTask', 'files/RemoveTask', { id: id }, function (res) {
    bt.msg(res)
    reader_realtime_tasks()
  })
}


function GetTaskCount () {
  $.post("/ajax?action=GetTaskCount", "", function (a) {
    if (a.status === false) {
      window.location.href = '/login?dologin=True';
      return;
    }
    $(".task").text(a)
  })
}

function setSelectChecked (c, d) {
  var a = document.getElementById(c);
  for (var b = 0; b < a.options.length; b++) {
    if (a.options[b].innerHTML == d) {
      a.options[b].selected = true;
      break
    }
  }
}
GetTaskCount();
function RecInstall () {
  $.post("/ajax?action=GetSoftList", "", function (l) {
    var c = "";
    var g = "";
    var e = "";
    for (var h = 0; h < l.length; h++) {
      if (l[h].name == "Tomcat") {
        continue
      }
      var o = "";
      var m = "<input id='data_" + l[h].name + "' data-info='" + l[h].name + " " + l[h].versions[0].version + "' type='checkbox' checked>";
      for (var b = 0; b < l[h].versions.length; b++) {
        var d = "";
        if ((l[h].name == "PHP" && (l[h].versions[b].version == "5.4" || l[h].versions[b].version == "54")) || (l[h].name == "MySQL" && l[h].versions[b].version == "5.5") || (l[h].name == "phpMyAdmin" && l[h].versions[b].version == "4.4")) {
          d = "selected";
          m = "<input id='data_" + l[h].name + "' data-info='" + l[h].name + " " + l[h].versions[b].version + "' type='checkbox' checked>"
        }
        o += "<option value='" + l[h].versions[b].version + "' " + d + ">" + l[h].name + " " + l[h].versions[b].version + "</option>"
      }
      var f = "<li><span class='ico'><img src='/static/img/" + l[h].name.toLowerCase() + ".png'></span><span class='name'><select id='select_" + l[h].name + "' class='sl-s-info'>" + o + "</select></span><span class='pull-right'>" + m + "</span></li>";
      if (l[h].name == "Nginx") {
        c = f
      } else {
        if (l[h].name == "Apache") {
          g = f
        } else {
          e += f
        }
      }
    }
    c += e;
    g += e;
    g = g.replace(new RegExp(/(data_)/g), "apache_").replace(new RegExp(/(select_)/g), "apache_select_");
    var k = layer.open({
      type: 1,
      title: lan.bt.install_title,
      area: ["658px", "423px"],
      closeBtn: 2,
      shadeClose: false,
      content: "<div class='rec-install'><div class='important-title'><p><span class='glyphicon glyphicon-alert' style='color: #f39c12; margin-right: 10px;'></span>" + lan.bt.install_ps + " <a href='javascript:jump()' style='color:#20a53a'>" + lan.bt.install_s + "</a> " + lan.bt.install_s1 + "</p></div><div class='rec-box'><h3>" + lan.bt.install_lnmp + "</h3><div class='rec-box-con'><ul class='rec-list'>" + c + "</ul><p class='fangshi'>" + lan.bt.install_type + "???<label data-title='" + lan.bt.install_rpm_title + "' style='margin-right:0'>" + lan.bt.install_rpm + "<input type='checkbox' checked></label><label data-title='" + lan.bt.install_src_title + "'>" + lan.bt.install_src + "<input type='checkbox'></label></p><div class='onekey'>" + lan.bt.install_key + "</div></div></div><div class='rec-box' style='margin-left:16px'><h3>LAMP</h3><div class='rec-box-con'><ul class='rec-list'>" + g + "</ul><p class='fangshi'>" + lan.bt.install_type + "???<label data-title='" + lan.bt.install_rpm_title + "' style='margin-right:0'>" + lan.bt.install_rpm + "<input type='checkbox' checked></label><label data-title='" + lan.bt.install_src_title + "'>" + lan.bt.install_src + "<input type='checkbox'></label></p><div class='onekey'>????????????</div></div></div></div>"
    });
    $(".fangshi input").click(function () {
      $(this).attr("checked", "checked").parent().siblings().find("input").removeAttr("checked")
    });
    $(".sl-s-info").change(function () {
      var p = $(this).find("option:selected").text();
      var n = $(this).attr("id");
      p = p.toLowerCase();
      $(this).parents("li").find("input").attr("data-info", p)
    });
    $("#apache_select_PHP").change(function () {
      var n = $(this).val();
      j(n, "apache_select_", "apache_")
    });
    $("#select_PHP").change(function () {
      var n = $(this).val();
      j(n, "select_", "data_")
    });

    function j (p, r, q) {
      var n = "4.4";
      switch (p) {
        case "5.2":
          n = "4.0";
          break;
        case "5.3":
          n = "4.0";
          break;
        case "5.4":
          n = "4.4";
          break;
        case "5.5":
          n = "4.4";
          break;
        default:
          n = "4.7"
      }
      $("#" + r + "phpMyAdmin option[value='" + n + "']").attr("selected", "selected").siblings().removeAttr("selected");
      $("#" + r + "_phpMyAdmin").attr("data-info", "phpmyadmin " + n)
    }
    $("#select_MySQL,#apache_select_MySQL").change(function () {
      var n = $(this).val();
      a(n)
    });

    $("#apache_select_Apache").change(function () {
      var apacheVersion = $(this).val();
      if (apacheVersion == '2.2') {
        layer.msg(lan.bt.install_apache22);
      } else {
        layer.msg(lan.bt.install_apache24);
      }
    });

    $("#apache_select_PHP").change(function () {
      var apacheVersion = $("#apache_select_Apache").val();
      var phpVersion = $(this).val();
      if (apacheVersion == '2.2') {
        if (phpVersion != '5.2' && phpVersion != '5.3' && phpVersion != '5.4') {
          layer.msg(lan.bt.insatll_s22 + 'PHP-' + phpVersion, { icon: 5 });
          $(this).val("5.4");
          $("#apache_PHP").attr('data-info', 'php 5.4');
          return false;
        }
      } else {
        if (phpVersion == '5.2') {
          layer.msg(lan.bt.insatll_s24 + 'PHP-' + phpVersion, { icon: 5 });
          $(this).val("5.4");
          $("#apache_PHP").attr('data-info', 'php 5.4');
          return false;
        }
      }
    });

    function a (n) {
      memSize = getCookie("memSize");
      max = 64;
      msg = "64M";
      switch (n) {
        case "5.1":
          max = 256;
          msg = "256M";
          break;
        case "5.7":
          max = 1500;
          msg = "2GB";
          break;
        case "5.6":
          max = 800;
          msg = "1GB";
          break;
        case "AliSQL":
          max = 800;
          msg = "1GB";
          break;
        case "mariadb_10.0":
          max = 800;
          msg = "1GB";
          break;
        case "mariadb_10.1":
          max = 1500;
          msg = "2GB";
          break
      }
      if (memSize < max) {
        layer.msg(lan.bt.insatll_mem.replace("{1}", msg).replace("{2}", n), {
          icon: 5
        })
      }
    }
    var de = null;
    $(".onekey").click(function () {
      if (de) return;
      var v = $(this).prev().find("input").eq(0).prop("checked") ? "1" : "0";
      var r = $(this).parents(".rec-box-con").find(".rec-list li").length;
      var n = "";
      var q = "";
      var p = "";
      var x = "";
      var s = "";
      de = true;
      for (var t = 0; t < r; t++) {
        var w = $(this).parents(".rec-box-con").find("ul li").eq(t);
        var u = w.find("input");
        if (u.prop("checked")) {
          n += u.attr("data-info") + ","
        }
      }
      q = n.split(",");
      loadT = layer.msg(lan.bt.install_to, {
        icon: 16,
        time: 0,
        shade: [0.3, "#000"]
      });
      for (var t = 0; t < q.length - 1; t++) {
        p = q[t].split(" ")[0].toLowerCase();
        x = q[t].split(" ")[1];
        s = "name=" + p + "&version=" + x + "&type=" + v + "&id=" + (t + 1);
        $.ajax({
          url: "/files?action=InstallSoft",
          data: s,
          type: "POST",
          async: false,
          success: function (y) { }
        });
      }
      layer.close(loadT);
      layer.close(k);
      setTimeout(function () {
        GetTaskCount()
      }, 2000);
      layer.msg(lan.bt.install_ok, {
        icon: 1
      });
      setTimeout(function () {
        task()
      }, 1000)
    });
    InstallTips();
    fly("onekey")
  })
}

function jump () {
  layer.closeAll();
  window.location.href = "/soft"
}

function InstallTips () {
  $(".fangshi label").mouseover(function () {
    var a = $(this).attr("data-title");
    layer.tips(a, this, {
      tips: [1, "#787878"],
      time: 0
    })
  }).mouseout(function () {
    $(".layui-layer-tips").remove()
  })
}

function fly (a) {
  var b = $("#task").offset();
  $("." + a).click(function (d) {
    var e = $(this);
    var c = $('<span class="yuandian"></span>');
    c.fly({
      start: {
        left: d.pageX,
        top: d.pageY
      },
      end: {
        left: b.left + 10,
        top: b.top + 10,
        width: 0,
        height: 0
      },
      onEnd: function () {
        layer.closeAll();
        layer.msg(lan.bt.task_add, {
          icon: 1
        });
        GetTaskCount()
      }
    });
  });
};


//???????????????
function checkSelect () {
  setTimeout(function () {
    var checkList = $("input[name=id]");
    var count = 0;
    for (var i = 0; i < checkList.length; i++) {
      if (checkList[i].checked) count++;
    }
    if (count > 0) {
      $("#allDelete").show();
    } else {
      $("#allDelete").hide();
    }
  }, 5);
}

//????????????
function listOrder (skey, type, obj) {
  or = getCookie('order');
  orderType = 'desc';
  if (or) {
    if (or.split(' ')[1] == 'desc') {
      orderType = 'asc';
    }
  }

  setCookie('order', skey + ' ' + orderType);

  switch (type) {
    case 'site':
      getWeb(1);
      break;
    case 'database':
      getData(1);
      break;
    case 'ftp':
      getFtp(1);
      break;
  }
  $(obj).find(".glyphicon-triangle-bottom").remove();
  $(obj).find(".glyphicon-triangle-top").remove();
  if (orderType == 'asc') {
    $(obj).append("<span class='glyphicon glyphicon-triangle-bottom' style='margin-left:5px;color:#bbb'></span>");
  } else {
    $(obj).append("<span class='glyphicon glyphicon-triangle-top' style='margin-left:5px;color:#bbb'></span>");
  }
}

// //???????????????
// function GetBtpanelList(){
// 	var con ='';
// 	$.post("/config?action=GetPanelList",function(rdata){
// 		for(var i=0; i<rdata.length; i++){
// 			con +='<h3 class="mypcip mypcipnew" style="opacity:.6" data-url="'+rdata[i].url+'" data-user="'+rdata[i].username+'" data-pw="'+rdata[i].password+'"><span class="f14 cw">'+rdata[i].title+'</span><em class="btedit" onclick="bindBTPanel(0,\'c\',\''+rdata[i].title+'\',\''+rdata[i].id+'\',\''+rdata[i].url+'\',\''+rdata[i].username+'\',\''+rdata[i].password+'\')"></em></h3>'
// 		}
// 		$("#newbtpc").html(con);
// 		$(".mypcipnew").hover(function(){
// 			$(this).css("opacity","1");
// 		},function(){
// 			$(this).css("opacity",".6");
// 		}).click(function(){
// 		$("#btpanelform").remove();
// 		var murl = $(this).attr("data-url");
// 		var user = $(this).attr("data-user");
// 		var pw = $(this).attr("data-pw");
// 		layer.open({
// 		  type: 2,
// 		  title: false,
// 		  closeBtn: 0, //?????????????????????
// 		  shade: [0],
// 		  area: ['340px', '215px'],
// 		  offset: 'rb', //???????????????
// 		  time: 5, //2??????????????????
// 		  anim: 2,
// 		  content: [murl+'/login', 'no']
// 		});
// 			var loginForm ='<div id="btpanelform" style="display:none"><form id="toBtpanel" action="'+murl+'/login" method="post" target="btpfrom">\
// 				<input name="username" id="btp_username" value="'+user+'" type="text">\
// 				<input name="password" id="btp_password" value="'+pw+'" type="password">\
// 				<input name="code" id="bt_code" value="12345" type="text">\
// 			</form><iframe name="btpfrom" src=""></iframe></div>';
// 			$("body").append(loginForm);
// 			layer.msg(lan.bt.panel_open,{icon:16,shade: [0.3, '#000'],time:1000});
// 			setTimeout(function(){
// 				$("#toBtpanel").submit();
// 			},500);
// 			setTimeout(function(){
// 				window.open(murl);
// 			},1000);
// 		});
// 		$(".btedit").click(function(e){
// 			e.stopPropagation();
// 		});
// 	})

// }
// GetBtpanelList();
// //????????????????????????
// function bindBTPanel(a,type,ip,btid,url,user,pw){
// 	var titleName = lan.bt.panel_add;
// 	if(type == "b"){
// 		btn = "<button type='button' class='btn btn-success btn-sm' onclick=\"bindBTPanel(1,'b')\">"+lan.public.add+"</button>";
// 	}
// 	else{
// 		titleName = lan.bt.panel_edit+ip;
// 		btn = "<button type='button' class='btn btn-default btn-sm' onclick=\"bindBTPaneldel('"+btid+"')\">"+lan.public.del+"</button><button type='button' class='btn btn-success btn-sm' onclick=\"bindBTPanel(1,'c','"+ip+"','"+btid+"')\" style='margin-left:7px'>"+lan.public.edit+"</button>";
// 	}
// 	if(url == undefined) url="http://";
// 	if(user == undefined) user="";
// 	if(pw == undefined) pw="";
// 	if(ip == undefined) ip="";
// 	if(a == 1) {
// 		var gurl = "/config?action=AddPanelInfo";
// 		var btaddress = $("#btaddress").val();
// 		if(!btaddress.match(/^(http|https)+:\/\/([\w-]+\.)+[\w-]+:\d+/)){
// 			layer.msg(lan.bt.panel_err_format+'<p>http://192.168.0.1:8888</p>',{icon:5,time:5000});
// 			return;
// 		}
// 		var btuser = encodeURIComponent($("#btuser").val());
// 		var btpassword = encodeURIComponent($("#btpassword").val());
// 		var bttitle = $("#bttitle").val();
// 		var data = "title="+bttitle+"&url="+encodeURIComponent(btaddress)+"&username="+btuser+"&password="+btpassword;
// 		if(btaddress =="" || btuser=="" || btpassword=="" || bttitle==""){
// 			layer.msg(lan.bt.panel_err_empty,{icon:8});
// 			return;
// 		}
// 		if(type=="c"){
// 			gurl = "/config?action=SetPanelInfo";
// 			data = data+"&id="+btid;
// 		}
// 		$.post(gurl, data, function(b) {
// 			if(b.status) {
// 				layer.closeAll();
// 				layer.msg(b.msg, {icon: 1});
// 				GetBtpanelList();
// 			} else {
// 				layer.msg(b.msg, {icon: 2})
// 			}
// 		});
// 		return
// 	}
// 	layer.open({
// 		type: 1,
// 		area: "400px",
// 		title: titleName,
// 		closeBtn: 2,
// 		shift: 5,
// 		shadeClose: false,
// 		content: "<div class='bt-form pd20 pb70'>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_address+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='text' name='btaddress' id='btaddress' value='"+url+"' placeholder='"+lan.bt.panel_address+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_user+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='text' name='btuser' id='btuser' value='"+user+"' placeholder='"+lan.bt.panel_user+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_pass+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='password' name='btpassword' id='btpassword' value='"+pw+"' placeholder='"+lan.bt.panel_pass+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_ps+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='text' name='bttitle' id='bttitle' value='"+ip+"' placeholder='"+lan.bt.panel_ps+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><ul class='help-info-text c7'><li>"+lan.bt.panel_ps_1+"</li><li>"+lan.bt.panel_ps_2+"</li><li>"+lan.bt.panel_ps_3+"</li></ul></div>\
// 		<div class='bt-form-submit-btn'><button type='button' class='btn btn-danger btn-sm' onclick=\"layer.closeAll()\">"+lan.public.close+"</button> "+btn+"</div></div>"
// 	});
// 	$("#btaddress").on("input",function(){
// 		var str =$(this).val();
// 		var isip = /([\w-]+\.){2,6}\w+/;
// 		var iptext = str.match(isip);
// 		if(iptext) $("#bttitle").val(iptext[0]);
// 	}).blur(function(){
// 		var str =$(this).val();
// 		var isip = /([\w-]+\.){2,6}\w+/;
// 		var iptext = str.match(isip);
// 		if(iptext) $("#bttitle").val(iptext[0]);
// 	});
// }
// //??????????????????
// function bindBTPaneldel(id){
// 	$.post("/config?action=DelPanelInfo","id="+id,function(rdata){
// 		layer.closeAll();
// 		layer.msg(rdata.msg,{icon:rdata.status?1:2});
// 		GetBtpanelList();
// 	})
// }

function getSpeed (sele) {
  if (!$(sele)) return;
  $.get('/ajax?action=GetSpeed', function (speed) {
    if (speed.title === null) return;
    mspeed = '';
    if (speed.speed > 0) {
      mspeed = '<span class="pull-right">' + ToSize(speed.speed) + '/s</span>';
    }
    body = '<p>' + speed.title + ' <img src="/static/img/ing.gif"></p>\
		<div class="bt-progress"><div class="bt-progress-bar" style="width:'+ speed.progress + '%"><span class="bt-progress-text">' + speed.progress + '%</span></div></div>\
		<p class="f12 c9"><span class="pull-left">'+ speed.used + '/' + speed.total + '</span>' + mspeed + '</p>';
    $(sele).prev().hide();
    $(sele).css({ "margin-left": "-37px", "width": "380px" });
    $(sele).parents(".layui-layer").css({ "margin-left": "-100px" });

    $(sele).html(body);
    setTimeout(function () {
      getSpeed(sele);
    }, 1000);
  });
}


/**
 * @description ????????????
 *
 */
function messagebox () {
  layer.open({
    type: 1,
    title: lan.bt.task_title,
    area: "680px",
    closeBtn: 2,
    shadeClose: false,
    content: '<div class="bt-form">' +
      '<div class="bt-w-main">' +
      '<div class="bt-w-menu">' +
      '<p class="bgw">' + lan.bt.task_list + ' (<span id="taskNum">0</span>)</p>' +
      '<p>' + lan.bt.task_msg + ' (<span id="taskCompleteNum">0</span>)</p>' +
      '<p>????????????</p>' +
      '</div>' +
      '<div class="bt-w-con pd15">' +
      '<div class="bt-w-item active" id="command_install_list"><ul class="cmdlist"></ul><div style="position: fixed;bottom: 15px;">??????????????????????????????????????????????????????????????????????????????????????????</div></div>' +
      '<div class="bt-w-item" id="messageContent"></div>' +
      '<div class="bt-w-item"><pre id="execLog" class="command_output_pre" style="height: 530px;"></pre></div>' +
      '</div>' +
      '</div>' +
      '</div>',
    success: function (layers, indexs) {
      $(layers).find('.bt-w-menu p').on('click', function () {
        var index = $(this).index()
        $(this).addClass('bgw').siblings().removeClass('bgw');
        $(layers).find('.bt-w-con .bt-w-item:eq(' + index + ')').addClass('active').siblings().removeClass('active');
        switch (index) {
          case 0:
            reader_realtime_tasks()
            break;
          case 1:
            reader_message_list()
            break;
          case 2:
            var loadT = bt.load('????????????????????????????????????...')
            bt.send('GetExecLog', 'files/GetExecLog', {}, function (res) {
              loadT.close();
              var exec_log = $('#execLog');
              exec_log.html(res)
              exec_log[0].scrollTop = exec_log[0].scrollHeight
            })
            break;
        }
      })
      reader_realtime_tasks()
      setTimeout(function () {
        reader_realtime_tasks()
      }, 1000)
      reader_message_list()
    }
  })
}





//????????????
function message_box () {
  layer.open({
    type: 1,
    title: lan.bt.task_title,
    area: "640px",
    closeBtn: 2,
    shadeClose: false,
    content: '<div class="bt-form">\
					<div class="bt-w-main">\
						<div class="bt-w-menu">\
							<p class="bgw" id="taskList" onclick="tasklist()">'+ lan.bt.task_list + '(<span class="task_count">0</span>)</p>\
							<p onclick="remind()">'+ lan.bt.task_msg + '(<span class="msg_count">0</span>)</p>\
							<p onclick="execLog()">????????????</p>\
						</div>\
						<div class="bt-w-con pd15">\
							<div class="taskcon"></div>\
						</div>\
					</div>\
				</div>'
  });
  $(".bt-w-menu p").click(function () {
    $(this).addClass("bgw").siblings().removeClass("bgw");
  });
  tasklist();
}



function get_message_data (page, callback) {
  if (typeof page === "function") callback = page, page = 1;
  var loadT = bt.load('????????????????????????????????????...');
  bt.send("getData", "data/getData", {
    tojs: 'reader_message_list',
    table: 'tasks',
    result: '2,4,6,8',
    limit: '11',
    search: '1',
    p: page
  }, function (res) {
    loadT.close();
    if (callback) callback(res);
  })
}

function reader_message_list (page) {
  get_message_data(page, function (res) {
    var html = "", f = false, task_count = 0;
    for (var i = 0; i < res.data.length; i++) {
      var item = res.data[i];
      if (item.status !== '1') {
        task_count++;
        continue;
      }
      html += '<tr><td><div class="titlename c3">' + item.name + '</span><span class="rs-status">???' + lan.bt.task_ok + '???<span><span class="rs-time">' + lan.bt.time + (item.end - item.start) + lan.bt.s + '</span></div></td><td class="text-right c3">' + item.addtime + '</td></tr>'
    }
    var con = '<div class="divtable"><table class="table table-hover">\
					<thead><tr><th>'+ lan.bt.task_name + '</th><th class="text-right">' + lan.bt.task_time + '</th></tr></thead>\
						<tbody id="remind">'+ html + '</tbody>\
					</table></div>\
					<div class="mtb15" style="height:32px">\
						<div class="pull-left buttongroup" style="display:none;"><button class="btn btn-default btn-sm mr5 rs-del" disabled="disabled">'+ lan.public.del + '</button><button class="btn btn-default btn-sm mr5 rs-read" disabled="disabled">' + lan.bt.task_tip_read + '</button><button class="btn btn-default btn-sm">' + lan.bt.task_tip_all + '</button></div>\
						<div id="taskPage" class="page"></div>\
					</div>';


    var msg_count = res.page.match(/\'Pcount\'>.+<\/span>/)[0].replace(/[^0-9]/ig, "");
    $("#taskCompleteNum").text(parseInt(msg_count) - task_count);
    $("#messageContent").html(con);
    $("#taskPage").html(res.page);
  })
}


function get_realtime_tasks (callback) {
  bt.send('GetTaskSpeed', 'files/GetTaskSpeed', {}, function (res) {
    if (callback) callback(res)
  })
}

var initTime = null, messageBoxWssock = null;

function reader_realtime_tasks (refresh) {
  get_realtime_tasks(function (res) {
    var command_install_list = $('#command_install_list'),
      loading = 'data:image/gif;base64,R0lGODlhDgACAIAAAHNzcwAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFDgABACwAAAAAAgACAAACAoRRACH5BAUOAAEALAQAAAACAAIAAAIChFEAIfkEBQ4AAQAsCAAAAAIAAgAAAgKEUQAh+QQJDgABACwAAAAADgACAAACBoyPBpu9BQA7',
      html = '',
      message = res.msg,
      task = res.task;
    $('#taskNum').html(typeof res.task === "undefined" ? 0 : res.task.length);
    if (typeof res.task === "undefined") {
      html = '<div style="padding:5px;">?????????????????????</div><div style="position: fixed;bottom: 15px;">??????????????????????????????????????????????????????????????????????????????????????????</div>'
      command_install_list.html(html)
    } else {
      var shell = '', message_split = message.split("\n"), del_task = '<a style="color:green" onclick="RemoveTask($id)" href="javascript:;">' + lan.public.del + '</a>', loading_img = "<img src='" + loading + "'/>";
      for (var j = 0; j < message_split.length; j++) {
        shell += message_split[j] + "</br>";
      }
      // if (command_install_list.find('li').length) {
      //   if (command_install_list.find('li').length > res.task.length) command_install_list.find('li:eq(0)').remove();
      //   if(task[0].status === '-1'){
      //     var is_scan = task[0].name.indexOf("??????") !== -1;
      //     command_install_list.find('li:eq(0) .state').html((is_scan ? lan.bt.task_scan : lan.bt.task_install) + ' ' + loading_img + ' | ' + del_task.replace('$id', task[0].id));
      //   }
      //   if (task[0].status !== '0' && !command_install_list.find('pre').length){
      //     command_install_list.find('li:eq(0)').append('<pre class=\'cmd command_output_pre\'>' + shell + '</pre>')
      //     messageBoxWssock.el = command_install_list.find('pre');
      //   }
      // } else {
      for (var i = 0; i < task.length; i++) {
        var item = task[i], task_html = '';
        if (item.status === '-1' && item.type === 'download') {
          task_html = "<div class='line-progress' style='width:" + message.pre + "%'></div><span class='titlename'>" + item.name + "<a style='margin-left:130px;'>" + (ToSize(message.used) + "/" + ToSize(message.total)) + "</a></span><span class='com-progress'>" + message.pre + "%</span><span class='state'>" + lan.bt.task_downloading + " " + loading_img + " | " + del_task.replace('$id', item.id) + "</span>";
        } else {
          task_html += '<span class="titlename">' + item.name + '</span>';
          task_html += '<span class="state">';
          switch(item.status){
            case '0':
              task_html += lan.bt.task_sleep + ' | ' + del_task.replace('$id', item.id);
              break
            case '-1':
              var is_scan = item.name.indexOf("??????") !== -1;
              task_html += (is_scan ? lan.bt.task_scan : lan.bt.task_install) + ' ' + loading_img + ' | ' + del_task.replace('$id', item.id);
              break
          }
          task_html += "</span>";
          if (item.type !== "download" && item.status === "-1") {
            task_html += '<pre class=\'cmd command_output_pre\'>' + shell + '</pre>'
          }
        }
        html += "<li>" + task_html + "</li>";
      }
      command_install_list.find('ul').html(html);
      // }
      if (task.length > 0 && task[0].status === '0') {
        setTimeout(function () {
          reader_realtime_tasks(true)
        }, 100)
      }
      if (command_install_list.find('pre').length) {
        var pre = command_install_list.find('pre')
        pre.scrollTop(pre[0].scrollHeight)
      }
      if (!refresh) {
        messageBoxWssock = bt_tools.command_line_output({
          el: '#command_install_list .command_output_pre',
          area: ['100%', '200px'],
          shell: 'tail -n 100 -f /tmp/panelExec.log',
          message: function (res) {
            if (res.indexOf('|-Successify --- ???????????????! ---') > -1) {
              setTimeout(function () {
                reader_realtime_tasks(true)
                reader_message_list()
              }, 100)
            }
          }
        });
      }
    }
  })
}


//??????????????????
function check_login () {
  $.post('/ajax?action=CheckLogin', {}, function (rdata) {
    if (rdata === true) return;
  });
}


//????????????
function to_login () {
  layer.confirm('?????????????????????????????????????????????!', { title: '???????????????', icon: 2, closeBtn: 1, shift: 5 }, function () {
    location.reload();
  });
}
//???????????????
function table_fixed (name) {
  var tableName = document.querySelector('#' + name);
  tableName.addEventListener('scroll', scroll_handle);
}
function scroll_handle (e) {
  var scrollTop = this.scrollTop;
  $(this).find("thead").css({ "transform": "translateY(" + scrollTop + "px)", "position": "relative", "z-index": "1" });
}
var clipboard, interval, socket, term, ssh_login, term_box;

var pdata_socket = {
  x_http_token: document.getElementById("request_token_head").getAttribute('token')
}
function loadLink (arry, param, callback) {
  var ready = 0;
  if (typeof param === 'function') callback = param
  for (var i = 0; i < arry.length; i++) {
    if (!Array.isArray(bt['loadLink'])) bt['loadLink'] = []
    if (!is_file_existence(arry[i], false)) {
      if ((arry.length - 1) === i && callback) callback();
      continue;
    };
    var link = document.createElement("link"), _arry_split = arry[i].split('/');
    link.rel = "stylesheet";
    if (typeof (callback) != "undefined") {
      if (link.readyState) {
        (function (i) {
          link.onreadystatechange = function () {
            if (link.readyState == "loaded" || script.readyState == "complete") {
              link.onreadystatechange = null;
              bt['loadLink'].push(arry[i]);
              ready++;
            }
          };
        })(i);
      } else {
        (function (i) {
          link.onload = function () {
            bt['loadLink'].push(arry[i]);
            ready++;
          };
        })(i);
      }
    }
    link.href = arry[i];
    document.body.appendChild(link);
  }
  var time = setInterval(function () {
    if (ready === arry.length) {
      clearTimeout(time);
      callback();
    }
  }, 10);
};
function loadScript (arry, param, callback) {
  var ready = 0;
  if (typeof param === 'function') callback = param
  for (var i = 0; i < arry.length; i++) {
    if (!Array.isArray(bt['loadScript'])) bt['loadScript'] = []
    if (!is_file_existence(arry[i], true)) {
      if ((arry.length - 1) === i && callback) callback();
      continue;
    };
    var script = document.createElement("script"), _arry_split = arry[i].split('/');
    script.type = "text/javascript";
    if (typeof (callback) != "undefined") {
      if (script.readyState) {
        (function (i) {
          script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
              script.onreadystatechange = null;
              bt['loadScript'].push(arry[i]);
              ready++;
            }
          };
        })(i);
      } else {
        (function (i) {
          script.onload = function () {
            bt['loadScript'].push(arry[i]);
            ready++;
          };
        })(i);
      }
    }
    script.src = arry[i];
    document.body.appendChild(script);
  }
  var time = setInterval(function () {
    if (ready === arry.length) {
      clearTimeout(time);
      callback();
    }
  }, 10);
}

// ????????????????????????
function is_file_existence (name, type) {
  var arry = type ? bt.loadScript : bt.loadLink
  for (var i = 0; i < arry.length; i++) {
    if (arry[i] === name) return false
  }

  for (var arryKey in arry) {
    var item = arry[arryKey]
  }
  return true
}
var Term = {
  bws: null,      //websocket??????
  route: '/webssh',  //??????????????????
  term: null,
  term_box: null,
  ssh_info: {},
  last_body: false,
  last_cd: null,
  config: {
    cols: 0,
    rows: 0,
    fontSize: 12
  },

  // 	????????????
  detectZoom: (function () {
    var ratio = 0,
      screen = window.screen,
      ua = navigator.userAgent.toLowerCase();
    if (window.devicePixelRatio !== undefined) {
      ratio = window.devicePixelRatio;
    }
    else if (~ua.indexOf('msie')) {
      if (screen.deviceXDPI && screen.logicalXDPI) {
        ratio = screen.deviceXDPI / screen.logicalXDPI;
      }
    }
    else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
      ratio = window.outerWidth / window.innerWidth;
    }

    if (ratio) {
      ratio = Math.round(ratio * 100);
    }
    return ratio;
  })(),
  //??????websocket
  connect: function () {
    if (!Term.bws || Term.bws.readyState == 3 || Term.bws.readyState == 2) {
      //??????
      ws_url = (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host + Term.route;
      Term.bws = new WebSocket(ws_url);
      //????????????
      Term.bws.addEventListener('message', Term.on_message);
      Term.bws.addEventListener('close', Term.on_close);
      Term.bws.addEventListener('error', Term.on_error);
      Term.bws.addEventListener('open', Term.on_open);
    }
  },

  //?????????????????????
  on_open: function (ws_event) {
    var http_token = $("#request_token_head").attr('token');
    Term.send(JSON.stringify({ 'x-http-token': http_token }))
    if (JSON.stringify(Term.ssh_info) !== "{}") Term.send(JSON.stringify(Term.ssh_info))
    // Term.term.FitAddon.fit();
    Term.resize();
    var f_path = $("#fileInputPath").val() || getCookie('Path');
    if (f_path) {
      Term.last_cd = "cd " + f_path;
      Term.send(Term.last_cd + "\n");
    }
  },

  //?????????????????????
  on_message: function (ws_event) {
    result = ws_event.data;
    if ((result.indexOf("@127.0.0.1:") != -1 || result.indexOf("@localhost:") != -1) && result.indexOf('Authentication failed') != -1) {
      Term.term.write(result);
      Term.localhost_login_form();
      Term.close();
      return;
    }
    if (Term.last_cd) {
      if (result.indexOf(Term.last_cd) != -1 && result.length - Term.last_cd.length < 3) {
        Term.last_cd = null;
        return;
      }
    }
    if (result === "\r?????????????????????!\r" || result == "\r????????????????????????!\r") {
      Term.close();
      return;
    }
    if (result.length > 1 && Term.last_body === false) {
      Term.last_body = true;
    }




    Term.term.write(result);
    if (result == '\r\n??????\r\n' || result == '\r\n??????\r\n' || result == '??????\r\n' || result == '??????\r\n' || result == '\r\nlogout\r\n' || result == 'logout\r\n') {
      setTimeout(function () {
        layer.close(Term.term_box);
        Term.term.dispose();
      }, 500);
      Term.close();
      Term.bws = null;
    }
  },

  //websocket????????????
  on_close: function (ws_event) {
    Term.bws = null;
  },

  //websocket????????????
  on_error: function (ws_event) {
    if (ws_event.target.readyState === 3) {
      if (Term.state === 3) return
      Term.term.write(msg)
      Term.state = 3;
    } else {
      // console.log(ws_event)
    }
  },

  //????????????
  close: function () {
    if (Term.bws) {
      Term.bws.close();
    }
  },

  resize: function () {
    $("#term").height($(".term_box_all .layui-layer-content").height() - 30)
    setTimeout(function () {
      Term.term.FitAddon.fit();
      Term.send(JSON.stringify({ resize: 1, rows: Term.term.rows, cols: Term.term.cols }));
      Term.term.focus();
    }, 400)
  },

  //????????????
  //@param event ??????????????????
  //@param data ???????????????
  //@param callback ???????????????????????????????????????,????????????????????????
  send: function (data, num) {
    //?????????????????????????????????????????????
    if (!Term.bws || Term.bws.readyState == 3 || Term.bws.readyState == 2) {
      Term.connect();
    }

    //????????????????????????,??????!=1??????100ms?????????????????????
    if (Term.bws.readyState === 1) {
      Term.bws.send(data);
    } else {
      if (Term.state === 3) return;
      if (!num) num = 0;
      if (num < 5) {
        num++;
        setTimeout(function () { Term.send(data, num++); }, 100)
      }
    }
  },
  run: function (ssh_info) {
    var loadT = layer.msg('??????????????????????????????????????????...', { icon: 16, time: 0, shade: 0.3 });
    loadScript([
      "/static/js/xterm.js"
    ], function () {
      layer.close(loadT);
      Term.term = new Terminal({
        rendererType: "canvas",
        cols: 100,
        rows: 34,
        fontSize: 15,
        screenKeys: true,
        useStyle: true,
      });
      Term.term.setOption('cursorBlink', true);
      Term.last_body = false;
      Term.term_box = layer.open({
        type: 1,
        title: '????????????',
        area: ['930px', '640px'],
        closeBtn: 2,
        shadeClose: false,
        skin: 'term_box_all',
        content: '<link rel="stylesheet" href="/static/css/xterm.css" />\
	            <div class="term-box" style="background-color:#000" id="term"></div>',
        cancel: function (index, lay) {
          bt.confirm({ msg: '??????SSH??????????????????????????????????????????????????????????????????????????????????????????', title: "???????????????SSH????????????" }, function (ix) {
            Term.term.dispose();
            layer.close(index);
            layer.close(ix);
            Term.close();
          });
          return false;
        },
        success: function () {
          $('.term_box_all').css('background-color', '#000');
          Term.term.open(document.getElementById('term'));
          Term.term.FitAddon = new FitAddon.FitAddon();
          Term.term.loadAddon(Term.term.FitAddon);
          Term.term.WebLinksAddon = new WebLinksAddon.WebLinksAddon()
          Term.term.loadAddon(Term.term.WebLinksAddon)
          Term.term.focus();
        }
      });
      Term.term.onData(function (data) {
        try {
          Term.bws.send(data)
        } catch (e) {
          Term.term.write('\r\n????????????,????????????????????????!\r\n')
          Term.connect()
        }
      });
      if (ssh_info) Term.ssh_info = ssh_info
      Term.connect();
    });

  },
  reset_login: function () {
    var ssh_info = {
      data: JSON.stringify({
        host: $("input[name='host']").val(),
        port: $("input[name='port']").val(),
        username: $("input[name='username']").val(),
        password: $("input[name='password']").val()
      })
    }
    $.post('/term_open', ssh_info, function (rdata) {
      if (rdata.status === false) {
        layer.msg(rdata.msg);
        return;
      }
      layer.closeAll();
      Term.connect();
      Term.term.scrollToBottom();
      Term.term.focus();
    });
  },
  localhost_login_form: function () {
    var template = '<div class="localhost-form-shade"><div class="localhost-form-view bt-form-2x"><div class="localhost-form-title"><i class="localhost-form_tip"></i><span style="vertical-align: middle;">????????????????????????????????????????????????????????????!</span></div>\
        <div class="line input_group">\
            <span class="tname">?????????IP</span>\
            <div class="info-r">\
                <input type="text" name="host" class="bt-input-text mr5" style="width:240px" placeholder="???????????????IP" value="127.0.0.1" autocomplete="off" />\
                <input type="text" name="port" class="bt-input-text mr5" style="width:60px" placeholder="??????" value="22" autocomplete="off"/>\
            </div>\
        </div>\
        <div class="line">\
            <span class="tname">SSH??????</span>\
            <div class="info-r">\
                <input type="text" name="username" class="bt-input-text mr5" style="width:305px" placeholder="??????SSH??????" value="root" autocomplete="off"/>\
            </div>\
        </div>\
        <div class="line">\
            <span class="tname">????????????</span>\
            <div class="info-r ">\
                <div class="btn-group">\
                    <button type="button" tabindex="-1" class="btn btn-sm auth_type_checkbox btn-success" data-ctype="0">????????????</button>\
                    <button type="button" tabindex="-1" class="btn btn-sm auth_type_checkbox btn-default data-ctype="1">????????????</button>\
                </div>\
            </div>\
        </div>\
        <div class="line c_password_view show">\
            <span class="tname">??????</span>\
            <div class="info-r">\
                <input type="text" name="password" class="bt-input-text mr5" placeholder="?????????SSH??????" style="width:305px;" value="" autocomplete="off"/>\
            </div>\
        </div>\
        <div class="line c_pkey_view hidden">\
            <span class="tname">??????</span>\
            <div class="info-r">\
                <textarea rows="4" name="pkey" class="bt-input-text mr5" placeholder="?????????SSH??????" style="width:305px;height: 80px;line-height: 18px;padding-top:10px;"></textarea>\
            </div>\
        </div><button type="submit" class="btn btn-sm btn-success">??????</button></div></div>';
    $('.term-box').after(template);
    $('.auth_type_checkbox').click(function () {
      var index = $(this).index();
      $(this).addClass('btn-success').removeClass('btn-default').siblings().removeClass('btn-success').addClass('btn-default')
      switch (index) {
        case 0:
          $('.c_password_view').addClass('show').removeClass('hidden');
          $('.c_pkey_view').addClass('hidden').removeClass('show').find('input').val('');
          break;
        case 1:
          $('.c_password_view').addClass('hidden').removeClass('show').find('input').val('');
          $('.c_pkey_view').addClass('show').removeClass('hidden');
          break;
      }
    });
    $('.localhost-form-view > button').click(function () {
      var form = {};
      $('.localhost-form-view input,.localhost-form-view textarea').each(function (index, el) {
        var name = $(this).attr('name'), value = $(this).val();
        form[name] = value;
        switch (name) {
          case 'port':
            if (!bt.check_port(value)) {
              bt.msg({ status: false, msg: '??????????????????????????????' });
              return false;
            }
            break;
          case 'username':
            if (value == '') {
              bt.msg({ status: false, msg: '??????????????????????????????!' });
              return false;
            }
            break;
          case 'password':
            if (value == '' && $('.c_password_view').hasClass('show')) {
              bt.msg({ status: false, msg: '???????????????????????????!' });
              return false;
            }
            break;
          case 'pkey':
            if (value == '' && $('.c_pkey_view').hasClass('show')) {
              bt.msg({ status: false, msg: '???????????????????????????!' });
              return false;
            }
            break;
        }
      });
      form.ps = '???????????????';
      var loadT = bt.load('???????????????????????????????????????...');
      bt.send('create_host', 'xterm/create_host', form, function (res) {
        loadT.close();
        bt.msg(res);
        if (res.status) {
          bt.msg({ status: true, msg: '???????????????' });
          $('.layui-layer-shade').remove();
          $('.term_box_all').remove();
          Term.term.dispose();
          Term.close();
          web_shell();
        }
      });
    });
    $('.localhost-form-view [name="password"]').keyup(function (e) {
      if (e.keyCode == 13) {
        $('.localhost-form-view > button').click();
      }
    }).focus()
  }
}




function web_shell () {
  Term.run();
}

socket = {
  emit: function (data, data2) {
    if (data === 'webssh') {
      data = data2
    }
    if (typeof (data) === 'object') {
      return;
    }
    Term.send(data);
  }
}



acme = {
  speed_msg: "<pre style='margin-bottom: 0px;height:250px;text-align: left;background-color: #000;color: #fff;white-space: pre-wrap;' id='create_lst'>[MSG]</pre>",
  loadT: null,
  //??????????????????
  get_orders: function (callback) {
    acme.request('get_orders', {}, function (rdata) {
      callback(rdata)
    }, '????????????????????????...');
  },
  //???????????????
  get_find: function (index, callback) {
    acme.request('get_order_find', { index: index }, function (rdata) {
      callback(rdata)
    }, '????????????????????????...')
  },

  //?????????????????????
  download_cert: function (index, callback) {
    acme.request('update_zip', { index: index }, function (rdata) {
      if (!rdata.status) {
        bt.msg(rdata);
        return;
      }
      if (callback) {
        callback(rdata)
      } else {
        window.location.href = '/download?filename=' + rdata.msg
      }

    }, '??????????????????..');
  },

  //????????????
  remove: function (index, callback) {
    acme.request('remove_order', { index: index }, function (rdata) {
      bt.msg(rdata);
      if (callback) callback(rdata)
    });
  },

  //????????????
  revoke: function (index, callback) {
    acme.request('revoke_order', { index: index }, function (rdata) {
      bt.msg(rdata);
      if (callback) callback(rdata)
    }, '??????????????????...');
  },

  //????????????(??????DNS??????)
  auth_domain: function (index, callback) {
    acme.show_speed_window('????????????DNS...', function () {
      acme.request('apply_dns_auth', { index: index }, function (rdata) {
        callback(rdata)
      }, false);
    });
  },

  //?????????????????????
  get_cert_init: function (pem_file, siteName, callback) {
    acme.request('get_cert_init_api', { pem_file: pem_file, siteName: siteName }, function (cert_init) {
      callback(cert_init);
    }, '????????????????????????...');
  },

  //????????????
  show_speed: function () {
    bt.send('get_lines', 'ajax/get_lines', {
      num: 10,
      filename: "/www/server/panel/logs/letsencrypt.log"
    }, function (rdata) {
      if ($("#create_lst").text() === "") return;
      if (rdata.status === true) {
        $("#create_lst").text(rdata.msg);
        $("#create_lst").scrollTop($("#create_lst")[0].scrollHeight);
      }
      setTimeout(function () { acme.show_speed(); }, 1000);
    });
  },

  //??????????????????
  show_speed_window: function (msg, callback) {
    acme.loadT = layer.open({
      title: false,
      type: 1,
      closeBtn: 0,
      shade: 0.3,
      area: "500px",
      offset: "30%",
      content: acme.speed_msg.replace('[MSG]', msg),
      success: function (layers, index) {
        setTimeout(function () {
          acme.show_speed();
        }, 1000);
        if (callback) callback();
      }
    });
  },

  //????????????
  //domain ???????????? []
  //auth_type ???????????? dns/http
  //auth_to ???????????? ??????????????????dnsapi
  //auto_wildcard ??????????????????????????? 1.??? 0.??? ??????0
  apply_cert: function (domains, auth_type, auth_to, auto_wildcard, callback) {
    acme.show_speed_window('??????????????????...', function () {
      if (auto_wildcard === undefined) auto_wildcard = '0'
      pdata = {
        domains: JSON.stringify(domains),
        auth_type: auth_type,
        auth_to: auth_to,
        auto_wildcard: auto_wildcard
      }

      if (acme.id) pdata['id'] = acme.id;
      if (acme.siteName) pdata['siteName'] = acme.siteName;
      acme.request('apply_cert_api', pdata, function (rdata) {
        callback(rdata);
      }, false);
    });
  },

  //????????????
  renew: function (index, callback) {
    acme.show_speed_window('??????????????????...', function () {
      acme.request('renew_cert', { index: index }, function (rdata) {
        callback(rdata)
      }, false);
    });
  },

  //??????????????????
  get_account_info: function (callback) {
    acme.request('get_account_info', {}, function (rdata) {
      callback(rdata)
    });
  },

  //??????????????????
  set_account_info: function (account, callback) {
    acme.request('set_account_info', account, function (rdata) {
      bt.msg(rdata)
      if (callback) callback(rdata)
    });
  },

  //???????????????
  request: function (action, pdata, callback, msg) {
    if (msg == undefined) msg = '????????????????????????...';
    if (msg) {
      var loadT = layer.msg(msg, { icon: 16, time: 0, shade: 0.3 });
    }
    $.post("/acme?action=" + action, pdata, function (res) {
      if (msg) layer.close(loadT)
      if (callback) callback(res)
    });
  }
}

// ????????????
function BindAccount (config) {
  this.verifyCode = false; // ?????????????????????
  this.verifyParam = {};
  this.clearIntervalVal = null;
  this.element = config;
}

BindAccount.prototype = {
  /**
   * @description ?????????
   * 
   */
  init: function () {
    var _this = this;
    this.element = {
      username: $("input[name='username']"),
      password: $("input[name='password']"),
      verifyCode: $("input[name='verifyCode']"),
      verifyCodeView: $(".verifyCodeView"),
      getVerifyCode: $(".getVerifyCode"),
      loginButton: $(".login-button")
    };

    _this.element.loginButton.on("click", function () {
      var param = {
        username: _this.element.username.val(),
        password: _this.element.password.val()
      };
      if (_this.verifyCode) {
        param['code'] = _this.element.verifyCode.val();
        param['token'] = _this.verifyParam.token;
      }
      if (!param.username || !param.password) {
        layer.msg('???????????????????????????', { icon: 2 });
        return;
      }
      if (param.username.length !== 11 && !bt.check_phone(param.username)) {
        layer.msg('???????????????????????????', { icon: 2 });
        return;
      }
      if (this.verifyCode && !param.code) {
        layer.msg('??????????????????', { icon: 2 });
        return;
      }
      _this.getAuthToken(param);
    });

    _this.element.password.on("keydown", simulatedClick);
    _this.element.verifyCode.on("keydown", simulatedClick);
    function simulatedClick (ev) {
      if (ev.keyCode == 13) _this.element.loginButton.click();
    }
    _this.element.getVerifyCode.on("click", function () {
      if ($(this).hasClass('active')) return;
      _this.countDown(60);
      _this.getBindCode(_this.verifyParam);
    });
  },

  /**
   * @description ??????????????????
   * @param {boolean} type  
   */
  bindUserView: function (type) {
    var _this = this;
    type = type || 0;
    layer.open({
      type: 1,
      title: '????????????????????????',
      area: '420px',
      closeBtn: 2,
      shadeClose: false,
      content: '<div class="libLogin" style="padding:20px 30px">\
          <div class="bt-form text-center">\
              <div class="line mb15" style="display:'+ (!type ? 'block' : 'none') + '">\
                <p>????????????????????????????????????????????? </p>\
                <h3 class="c2 f16 text-center mtb20">?????????????????????????????????????????????<a href="javascript:;" class="bind_ps bt-ico-ask">?</a></h3>\
              </div>\
              <div class="line mb15" style="display:'+ (!type ? 'none' : 'block') + '">\
                <h3 class="c2 f16 text-center mtb20">????????????????????????<a href="javascript:;" class="bind_ps bt-ico-ask">?</a></h3>\
              </div>\
              <div div class= "line" > <input class="bt-input-text" type="text" name="username" placeholder="?????????" /></div>\
              <div class="line"><input class="bt-input-text" type="password" name="password" placeholder="??????" /></div>\
              <div class="line verifyCodeView"><input class="bt-input-text" type="text" name="verifyCode" placeholder="?????????" /><div class="pull-right"><span class="getVerifyCode">???????????????</span></div></div>\
              <div class="line" style="margin-top: 15px;"><input class="login-button" value="??????" type="button" /></div>\
              <p class="text-right"><a class="btlink" href="https://www.bt.cn/register.html" target="_blank">???????????????????????????</a></p>\
          </div >\
      </div > ',
      success: function () {
        var time = '';
        _this.init();
        $('.bind_ps').hover(function () {
          var _that = $(this);
          time = setTimeout(function () {
            layer.tips('??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????', _that, { tips: [1, '#20a53a'], time: 0 })
          }, 500);
        }, function () {
          clearTimeout(time)
          layer.closeAll('tips');
        })
      },
      cancel: function () {
        if (!type) {
          layer.alert('<ul class="help-info-text" style="margin-top:0px;">\
          <li>?????????????????????????????????????????????????????????????????????</li>\
          <li>?????????????????????????????????????????????????????????????????????</li>\
          <li>?????????????????????????????????????????????????????????</li>\
          <li>??????QQ???800176556??????????????????0769-23030556</li>\
          </ul>', { btn: '????????????', title: '????????????', area: '500px' }, function (index) {
            layer.close(index);
          });
          return false;
        }
      }
    });
  },
  /**
   * @description ??????????????????
   * @param {object} param ??????{username:?????????,password:??????,code:?????????,??????}
   * @param {function} callback ????????????
   * @returns void
   */
  getAuthToken: function (param) {
    var _this = this;
    var loadT = bt.load('????????????????????????????????????...');
    bt.send('GetAuthToken', 'ssl/GetAuthToken', param, function (rdata) {
      loadT.close();
      if (rdata.status) {
        bt.msg(rdata);
        if (rdata.status) window.location.href = "/"
      }
      if (typeof rdata.data == "undefined") return false
      if (!rdata.status && JSON.stringify(rdata.data) === '[]') bt.msg(rdata);
      if (rdata.data.code === -1) {
        layer.msg(rdata.msg)
        _this.verifyParam = { username: param.username, token: rdata.data.token }
        _this.verifyCodeView();
      }
    })
  },

  /**
   * @description ?????????
   * @param {object} param 
  */
  countDown: function (time, callback) {
    var _this = this;
    if (this.clearIntervalVal) clearInterval(this.clearIntervalVal);
    this.clearIntervalVal = setInterval(function () {
      time--;
      if (time <= 0) {
        _this.element.getVerifyCode.removeClass('active');
        _this.element.getVerifyCode.text('???????????????');
        callback && callback();
        return;
      }
      _this.element.getVerifyCode.addClass('active');
      _this.element.getVerifyCode.text('????????????(' + time + 's)');
    }, 1000)
  },

  /**
   * @description ????????????
   * @param {object} rdata ????????????????????? {token:token,username:?????????}
   */
  verifyCodeView: function () {
    this.verifyCode = true;
    this.element.verifyCodeView.show();
    this.element.getVerifyCode.click();
    this.element.verifyCode.focus();
    this.element.username.attr('disabled', true);
    this.element.password.attr('disabled', true);
  },

  /**
   * @description ???????????????
   * @param {object} param ??????{token:????????????,username:?????????}
   * @param {function} callback ????????????
   * @returns void
   */
  getBindCode: function (param, callback) {
    var loadT = bt.load('???????????????????????????...');
    bt.send('GetBindCode', 'ssl/GetBindCode', param, function (rdata) {
      loadT.close();
      bt.msg(rdata);
      if (callback) callback(rdata);
    })
  }
}

var product_recommend = {
  data:null,
  /**
   * @description ?????????
   */
  init:function(callback){
    var _this = this;
    if(location.pathname.indexOf('bind') > -1) return;
    this.get_product_type(function (rdata) {
      _this.data = rdata
      if(callback) callback(rdata)
    })
  },
  /**
   * @description ??????????????????
   * @param {object} type ??????{type:??????}
   */
  get_recommend_type:function(type){
    var config = null,pathname = location.pathname.replace('/','') || 'home';
    for (var i = 0; i < this.data.length; i++) {
      var item = this.data[i];
      if(item.type == type && item.show) config = item
    }
    return config
  },

  /**
   * @description ?????????????????????
   * @param {} name 
   */
  get_version_event:function (item,param,config) {
    bt.soft.get_soft_find(item.name,function(res){
      if(!item.isBuy){
        product_recommend.recommend_product_view(item, config)
      }else if(!res.setup){
        bt.soft.install(item.name)
      }else{
        bt.plugin.get_plugin_byhtml(item.name,function(html){
          if(typeof html === "string"){
            layer.open({ 
              type:1,
              shade:0,
              skin:'hide',
              content:html, 
              success:function(){
                var is_event = false;
                for (var i = 0; i < item.eventList.length; i++) {
                  var data = item.eventList[i];
                  var oldVersion = data.version.replace('.',''),newVersion = res.version.replace('.','');
                  if(newVersion <= oldVersion){
                    is_event = true
                    setTimeout(function () {                                                                                                                                                                                                                                                                                                                                                                                     
                      new Function(data.event.replace('$siteName',param))() 
                    },100)
                    break; 
                  }
                }
                if(!is_event) new Function(item.eventList[item.eventList.length - 1].event.replace('$siteName',param))() 
              }
            })
          }
        })
      }

    })
  },
  /**
   * @description ??????????????????
   */
  get_pay_status:function(cnf){
    if(typeof cnf === 'undefined') cnf = { isBuy:false }
    var pro_end = parseInt(bt.get_cookie('pro_end') || -1)
    var ltd_end = parseInt(bt.get_cookie('ltd_end')  || -1)
    var is_pay = pro_end > -1 || ltd_end > -1 || cnf.isBuy; // ????????????????????????
    var advanced = 'ltd'; // ?????????????????????????????????
    if(pro_end === -2 || pro_end > -1) advanced = 'pro';
    if(ltd_end === -2 || ltd_end > -1) advanced = 'ltd';
    var end_time = advanced === 'ltd'? ltd_end:pro_end; // ????????????
    return { advanced: advanced, is_pay:is_pay,  end_time:end_time };
  },
  /**
   * @description ??????????????????
   * @param {String} type ?????????????????????????????????
   * @param {Number} source ???????????????
   * @param {Object} plugin ??????????????????
   */
  pay_product_sign:function (type, source, plugin) {
    if(typeof plugin != 'undefined' && plugin == 'ltd') return  bt.soft.product_pay_view({totalNum:source,limit:'ltd',closePro:true})
    switch (type) {
      case 'pro':
        bt.soft['updata_' + type](source);
        break;
      case 'ltd':
        bt.soft['updata_' + type](false, source);
        break;
    }
  },
  /**
   * @description ??????????????????
   * @param {Function} callback ????????????
   */
  get_product_type:function(callback){
    bt.send('get_pay_type','ajax/get_pay_type',{},function(rdata){
      bt.set_storage('session','get_pay_type',JSON.stringify(rdata))
      if(callback) callback(rdata)
    })
  },
  /**
   * @description ??????????????????
   * @param {Object} pay_id ???????????????id
  */
  recommend_product_view: function (data, config) {
    var name = data.name.split('_')[0];
    var status = this.get_pay_status(data);
    bt.open({
      title:false,
      area: '650px',
      btn:false,
      content:'<div class="ptb15" style="display: flex;">\
        <div class="product_view"><img src="/static/images/recommend/'+ name +'.png"/></div>\
        <div class="product_describe ml10">\
          <div class="describe_title">'+ data.pluginName +'</div>\
          <div class="describe_ps">'+ data.ps +'</div>\
          <div class="product_describe_btn">\
            <a class="btn btn-default mr10 btn-sm productPreview '+ (!data.preview?'hide':'') +'" href="'+ data.preview +'" target="_blank">????????????</a><button class="btn btn-success btn-sm buyNow">????????????</button>\
          </div>\
        </div>\
      </div>',
      success:function () {
				var area = config && config.imgArea ? config.imgArea : ['650px','450px']
        // ????????????
        $('.product_view img').click(function () {
          layer.open({
            type:1,
            title:'????????????',
            area: area,
            closeBtn:2,
            btn:false,
            content:'<img src="/static/images/recommend/'+ name +'.png" style="width:100%" />'
          })
        })
        // ????????????
        $('.buyNow').click(function(){
          switch (status.advanced) {
            case 'pro':
              bt.soft['updata_' + status.advanced](data.pay);
              break;
            case 'ltd':
              bt.soft['updata_' + status.advanced](false, data.pay);
              break;
          }
        })
      }
    })
  }
}

// ????????????/????????????
var ConfigIsPush = false;

function open_three_channel_auth(stype,height){
  var _title = '??????????????????',
      _area = '600px',
      isPush = false,
      assign = ''
  if(stype == 'MsgPush'){  //????????????
    _title = '??????????????????'
    _area = ['900px', '603px']
    isPush = true
  }else if(typeof stype != 'undefined' && stype){   //??????????????????????????????????????????
    assign = stype
  }
  ConfigIsPush = isPush
  layer.open({
    type: 1,
    area: _area,
    title: _title,
    closeBtn: 2,
    shift: 5,
    shadeClose: false,
    content: '\
		<div class="bt-form alarm-view">\
			<div class="bt-w-main" >\
				<div class="bt-w-menu" '+(isPush?'style="width:160px"':'')+'></div>\
				<div class="bt-w-con pd15" '+(isPush?'style="margin-left:160px"':'')+'>\
					<div class="plugin_body" '+(height?'style="'+height+'"':'')+'></div>\
				</div>\
			</div>\
		</div >',
    success: function() {
      getMsgConfig(assign?assign:'');
    }
  })
}

function getTemplateMsgConfig (item) {
  $.post('/'+(ConfigIsPush?'push':'config')+'?action=get_module_template', {
    module_name: item.name
  }, function(res) {
    if (res.status) {
      $(".bt-w-main .plugin_body").html(res.msg.trim())

      $(".bt-w-main .plugin_body").append('<div class="plugin_update" '+(ConfigIsPush?'style="width:738px"':'')+'><button class="btn btn-danger btn-sm" onclick="uninstallMsgModuleConfig()">??????/????????????</button></div>')
      if (item['version'] != item['info']['version']) {
        $(".bt-w-main .plugin_body").append('<div class="plugin_update" style="width:408px" >???' + item['title'] + '???????????????????????????,?????????????????????,?????????.<button class="btn btn-success btn-sm" onclick="installMsgModuleConfig()" >????????????</button></div>')
      }
    } else {
      $(".bt-w-main .plugin_body").html(shtml);
    }
    new Function(item.name + '.init()')()
  })
}

function getMsgConfig(openType){
  var _api = '/config?action=get_msg_configs'
  if(ConfigIsPush) _api = '/push?action=get_modules_list'

  $.post(_api, function(rdata) {
    var menu_data = $(".alarm-view .bt-w-menu p.bgw").data('data'),
        _menu = ''
    $('.alarm-view .bt-w-menu').html('');
    $.each(rdata, function(index, item) {
			var _default = item.data && item.data.default;
			var _flag = '';
			if (_default) {
				_flag = '<span class="show-default"></span>'
			}
      _menu = $('<p class=\'men_' + item['name'] + '\'>' + item['title'] + _flag + '</p>').data('data', item)
      $('.alarm-view .bt-w-menu').append(_menu)
    });
    $('.alarm-view .bt-w-menu').append('<a style="position:absolute;bottom: 0;line-height: 40px;width:108px;text-align: center;" class="btlink" onclick="refreshThreeChannelAuth()">????????????</a>')
    $(".alarm-view .bt-w-menu p").click( function() {
      $(this).addClass('bgw').siblings().removeClass('bgw')
      var _item = $(this).data('data');

      var shtml = '<div class="plugin_user_info c7">\
                            <p><b>?????????</b>' + _item.title + '</p>\
                            <p><b>?????????</b>' + _item.version + '</p>\
                            <p><b>?????????</b>' + _item.date + '</p>\
                            <p><b>?????????</b>' + _item.ps + '</p>\
                            <p><b>?????????</b><a class="btlink" href="' + _item.help + '" target=" _blank">' + _item.help + '</a></p>\
                            <p><button class="btn btn-success btn-sm mt1" onclick="installMsgModuleConfig(\''+ _item.name +'\')">????????????</button></p>\
                     </div>'
      if (_item['setup']) {
        getTemplateMsgConfig(_item)
      } else {
        $(".bt-w-main .plugin_body").html(shtml);
      }
    });
    if (menu_data) {
      $('.men_' + menu_data['name']).click();
    } else {
      if(typeof openType != 'undefined' && openType){
        $('.alarm-view .bt-w-menu p.men_'+openType).trigger('click')
      }else{
        $('.alarm-view .bt-w-menu p').eq(0).trigger('click')
      }
    }
  })
}

function installMsgModuleConfig (name) {
  var _api = '/config?action=install_msg_module'
  if(ConfigIsPush) _api = '/push?action=install_module'
	name = name ? '.men_' + name : '';
  var _item = $(".bt-w-menu p.bgw" +  name ).data('data');
  var spt = '??????'
  if (_item.setup) spt = '??????'

  layer.confirm('?????????' + spt + '???' + _item.title + '?????????', {
    title: '????????????',
    closeBtn: 2,
    icon: 0
  }, function() {
    var loadT = layer.msg('??????' + spt + _item.title + '?????????,?????????...', {
      icon: 16,
      time: 0,
      shade: [0.3, '#000']
    });
    $.post(_api+'&name=' + _item.name + '', function(res) {
      getMsgConfig()
      layer.close(loadT)
      layer.msg(res.msg, {
        icon: res.status ? 1 : 2
      })
    })
  })
}

function uninstallMsgModuleConfig () {
  var _api = '/config?action=uninstall_msg_module'
  if(ConfigIsPush) _api = '/push?action=uninstall_module'

  var _item = $(".bt-w-menu p.bgw").data('data');

  layer.confirm('????????????????????????' + _item.title + '?????????', {
    title: '????????????',
    closeBtn: 2,
    icon: 0
  }, function() {
    var loadT = layer.msg('????????????' + _item.title + '?????????,?????????...', {
      icon: 16,
      time: 0,
      shade: [0.3, '#000']
    });
    $.post(_api+'&name=' + _item.name + '', function(res) {
      layer.close(loadT)
      getMsgConfig()
      layer.msg(res.msg, {
        icon: res.status ? 1 : 2
      })
    })
  })
}

function refreshThreeChannelAuth () {
  var _api = '/config?action=get_msg_configs'
  if(ConfigIsPush) _api = '/push?action=get_modules_list'

  var loadT = layer.msg('???????????????????????????,?????????...', {
    icon: 16,
    time: 0,
    shade: [0.3, '#000']
  });
  layer.confirm('???????????????????????????????????????', {
    title: '????????????',
    closeBtn: 2,
    icon: 0
  }, function() {
    layer.closeAll()
    $.post(_api, {
      force: 1
    }, function(rdata) {
      layer.close(loadT)
      open_three_channel_auth(ConfigIsPush?'MsgPush':'');
    })
  })
}

