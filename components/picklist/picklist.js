/**
 * PrimeUI picklist widget
 */
(function() {

    $.widget("primeui.puipicklist", {
       
        options: {
            effect: 'fade',
            effectSpeed: 'fast',
            sourceCaption: null,
            targetCaption: null,
            filter: false,
            filterFunction: null,
            filterMatchMode: 'startsWith',
            dragdrop: true,
            sourceData: null,
            targetData: null,
            content: null,
            template: null,
            responsive: false
        },

        _create: function() {
            this.element.uniqueId().addClass('ui-picklist ui-widget ui-helper-clearfix');
            if(this.options.responsive) {
                this.element.addClass('ui-picklist-responsive');
            }
            this.inputs = this.element.children('select');
            this.items = $();
            this.sourceInput = this.inputs.eq(0);
            this.targetInput = this.inputs.eq(1);
            
            if(this.options.sourceData) {
                this._populateInputFromData(this.sourceInput, this.options.sourceData);
            }
            
            if(this.options.targetData) {
                this._populateInputFromData(this.targetInput, this.options.targetData);
            }
                        
            this.sourceList = this._createList(this.sourceInput, 'ui-picklist-source', this.options.sourceCaption);
            this._createButtons();
            this.targetList = this._createList(this.targetInput, 'ui-picklist-target', this.options.targetCaption);
            
            if(this.options.showSourceControls) {
                this.element.prepend(this._createListControls(this.sourceList, 'ui-picklist-source-controls'));
            }
            
            if(this.options.showTargetControls) {
                this.element.append(this._createListControls(this.targetList, 'ui-picklist-target-controls'));
            }
            
            this._bindEvents();
        },
                
        _populateInputFromData: function(input, data) {
            for(var i = 0; i < data.length; i++) {
                var choice = data[i];
                if(choice.label)
                    input.append('<option value="' + choice.value + '">' + choice.label + '</option>');
                else
                    input.append('<option value="' + choice + '">' + choice + '</option>');
            }
        },
                
        _createList: function(input, cssClass, caption) {                        
            var listWrapper = $('<div class="ui-picklist-listwrapper ' + cssClass + '-wrapper"></div>'),
                listContainer = $('<ul class="ui-widget-content ui-picklist-list ' + cssClass + '"></ul>');

            if(this.options.filter) {
                listWrapper.append('<div class="ui-picklist-filter-container"><input type="text" class="ui-picklist-filter" /><span class="fa fa-fw fa-search"></span></div>');
                listWrapper.find('> .ui-picklist-filter-container > input').puiinputtext();
            } 
    
            if(caption) {
                listWrapper.append('<div class="ui-picklist-caption ui-widget-header ui-corner-tl ui-corner-tr">' + caption + '</div>');
                listContainer.addClass('ui-corner-bottom');
            }
            else {
                listContainer.addClass('ui-corner-all');
            }

            this._populateContainerFromOptions(input, listContainer);
            
            
            listWrapper.append(listContainer);
            input.addClass('ui-helper-hidden').appendTo(listWrapper);
            listWrapper.appendTo(this.element);
            
            return listContainer;
        },

        _populateContainerFromOptions: function(input, listContainer, data) {
            var choices = input.children('option');
            for(var i = 0; i < choices.length; i++) {
                var choice = choices.eq(i),
                content = this._createItemContent(choice.get(0)),
                item = $('<li class="ui-picklist-item ui-corner-all"></li>').data({
                    'item-label': choice.text(),
                    'item-value': choice.val()
                });

                if($.type(content) === 'string')
                    item.html(content);
                else
                    item.append(content);

                this.items = this.items.add(item);
                listContainer.append(item);
            }
        },

        _createButtons: function() {
            var $this = this,
            buttonContainer = $('<div class="ui-picklist-buttons"><div class="ui-picklist-buttons-cell"></div>');
            
            buttonContainer.children('div').append(this._createButton('fa-angle-right', 'ui-picklist-button-add', function(){$this._add();}))
                            .append(this._createButton('fa-angle-double-right', 'ui-picklist-button-addall', function(){$this._addAll();}))
                            .append(this._createButton('fa-angle-left', 'ui-picklist-button-remove', function(){$this._remove();}))
                            .append(this._createButton('fa-angle-double-left', 'ui-picklist-button-removeall', function(){$this._removeAll();}));
                    
            this.element.append(buttonContainer);
        },
                
        _createListControls: function(list, cssClass) {
            var $this = this,
            buttonContainer = $('<div class="' + cssClass + ' ui-picklist-buttons"><div class="ui-picklist-buttons-cell"></div>');
            
            buttonContainer.children('div').append(this._createButton('fa-angle-up', 'ui-picklist-button-move-up', function(){$this._moveUp(list);}))
                            .append(this._createButton('fa-angle-double-up', 'ui-picklist-button-move-top', function(){$this._moveTop(list);}))
                            .append(this._createButton('fa-angle-down', 'ui-picklist-button-move-down', function(){$this._moveDown(list);}))
                            .append(this._createButton('fa-angle-double-down', 'ui-picklist-button-move-bottom', function(){$this._moveBottom(list);}));
                    
            return buttonContainer;
        },
                
        _createButton: function(icon, cssClass, fn) {
            var btn = $('<button class="' + cssClass + '" type="button"></button>').puibutton({
                'icon': icon,
                'click': function() {
                    fn();
                    $(this).removeClass('ui-state-hover ui-state-focus');
                }

            });
            
            return btn;
        },
                
        _bindEvents: function() {
            var $this = this;
        
            this.items.on('mouseover.puipicklist', function(e) {
                var element = $(this);

                if(!element.hasClass('ui-state-highlight')) {
                    $(this).addClass('ui-state-hover');
                }
            })
            .on('mouseout.puipicklist', function(e) {
                $(this).removeClass('ui-state-hover');
            })
            .on('click.puipicklist', function(e) {
                var item = $(this),
                metaKey = (e.metaKey||e.ctrlKey);

                if(!e.shiftKey) {
                    if(!metaKey) {
                        $this.unselectAll();
                    }

                    if(metaKey && item.hasClass('ui-state-highlight')) {
                        $this.unselectItem(item);
                    } 
                    else {
                        $this.selectItem(item);
                        $this.cursorItem = item;
                    }
                }
                else {
                    $this.unselectAll();

                    if($this.cursorItem && ($this.cursorItem.parent().is(item.parent()))) {
                        var currentItemIndex = item.index(),
                        cursorItemIndex = $this.cursorItem.index(),
                        startIndex = (currentItemIndex > cursorItemIndex) ? cursorItemIndex : currentItemIndex,
                        endIndex = (currentItemIndex > cursorItemIndex) ? (currentItemIndex + 1) : (cursorItemIndex + 1),
                        parentList = item.parent();

                        for(var i = startIndex ; i < endIndex; i++) {
                            $this.selectItem(parentList.children('li.ui-picklist-item').eq(i));
                        }
                    }
                    else {
                        $this.selectItem(item);
                        $this.cursorItem = item;
                    }
                }
            })
            .on('dblclick.pickList', function() {
                var item = $(this);

                if($(this).closest('.ui-picklist-listwrapper').hasClass('ui-picklist-source-wrapper'))
                    $this._transfer(item, $this.sourceList, $this.targetList, 'dblclick');
                else
                    $this._transfer(item, $this.targetList, $this.sourceList, 'dblclick');

                PUI.clearSelection();
            });
            
            if(this.options.filter) {
                this._setupFilterMatcher();
                
                this.element.find('> .ui-picklist-source-wrapper > .ui-picklist-filter-container > input').on('keyup', function(e) {
                    $this._filter(this.value, $this.sourceList);
                });

                this.element.find('> .ui-picklist-target-wrapper > .ui-picklist-filter-container > input').on('keyup', function(e) {
                    $this._filter(this.value, $this.targetList);
                });
            }
            
            if(this.options.dragdrop) {                
                this.element.find('> .ui-picklist-listwrapper > ul.ui-picklist-list').sortable({
                    cancel: '.ui-state-disabled',
                    connectWith: '#' + this.element.attr('id') + ' .ui-picklist-list',
                    revert: 1,
                    update: function(event, ui) {
                        $this.unselectItem(ui.item);

                        $this._saveState();
                    },
                    receive: function(event, ui) {
                        $this._triggerTransferEvent(ui.item, ui.sender, ui.item.closest('ul.ui-picklist-list'), 'dragdrop');
                    }
                });
            }
        },
                
        selectItem: function(item) {
            item.removeClass('ui-state-hover').addClass('ui-state-highlight');
        },

        unselectItem: function(item) {
            item.removeClass('ui-state-highlight');
        },

        unselectAll: function() {
            var selectedItems = this.items.filter('.ui-state-highlight');
            for(var i = 0; i < selectedItems.length; i++) {
                this.unselectItem(selectedItems.eq(i));
            }
        },
                
        _add: function() {
            var items = this.sourceList.children('li.ui-picklist-item.ui-state-highlight');

            this._transfer(items, this.sourceList, this.targetList, 'command');
        },

        _addAll: function() {
            var items = this.sourceList.children('li.ui-picklist-item:visible:not(.ui-state-disabled)');

            this._transfer(items, this.sourceList, this.targetList, 'command');
        },

        _remove: function() {
            var items = this.targetList.children('li.ui-picklist-item.ui-state-highlight');

            this._transfer(items, this.targetList, this.sourceList, 'command');
        },

        _removeAll: function() {
            var items = this.targetList.children('li.ui-picklist-item:visible:not(.ui-state-disabled)');

            this._transfer(items, this.targetList, this.sourceList, 'command');
        },
                
        _moveUp: function(list) {
            var $this = this,
            animated = $this.options.effect,
            items = list.children('.ui-state-highlight'),
            itemsCount = items.length,
            movedCount = 0;

            items.each(function() {
                var item = $(this);
                
                if(!item.is(':first-child')) {
                    if(animated) {
                        item.hide($this.options.effect, {}, $this.options.effectSpeed, function() {
                            item.insertBefore(item.prev()).show($this.options.effect, {}, $this.options.effectSpeed, function() {
                                movedCount++;

                                if(movedCount === itemsCount) {
                                    $this._saveState();
                                }
                            });
                        });
                    }
                    else {
                        item.hide().insertBefore(item.prev()).show();
                    }

                }
            });

            if(!animated) {
                this._saveState();
            }

        },

        _moveTop: function(list) {
            var $this = this,
            animated = $this.options.effect,
            items = list.children('.ui-state-highlight'),
            itemsCount = items.length,
            movedCount = 0;

            list.children('.ui-state-highlight').each(function() {
                var item = $(this);

                if(!item.is(':first-child')) {
                    if(animated) {
                        item.hide($this.options.effect, {}, $this.options.effectSpeed, function() {
                            item.prependTo(item.parent()).show($this.options.effect, {}, $this.options.effectSpeed, function(){
                                movedCount++;

                                if(movedCount === itemsCount) {
                                    $this._saveState();
                                }
                            });
                        });
                    }
                    else {
                        item.hide().prependTo(item.parent()).show();
                    }
                }
            });

            if(!animated) {
                this._saveState();
            }
        },

        _moveDown: function(list) {
            var $this = this,
            animated = $this.options.effect,
            items = list.children('.ui-state-highlight'),
            itemsCount = items.length,
            movedCount = 0;

            $(list.children('.ui-state-highlight').get().reverse()).each(function() {
                var item = $(this);

                if(!item.is(':last-child')) {
                    if(animated) {
                        item.hide($this.options.effect, {}, $this.options.effectSpeed, function() {
                            item.insertAfter(item.next()).show($this.options.effect, {}, $this.options.effectSpeed, function() {
                                movedCount++;

                                if(movedCount === itemsCount) {
                                    $this._saveState();
                                }
                            });
                        });
                    }
                    else {
                        item.hide().insertAfter(item.next()).show();
                    }
                }

            });

            if(!animated) {
                this._saveState();
            }
        },

        _moveBottom: function(list) {
            var $this = this,
            animated = $this.options.effect,
            items = list.children('.ui-state-highlight'),
            itemsCount = items.length,
            movedCount = 0;

            list.children('.ui-state-highlight').each(function() {
                var item = $(this);

                if(!item.is(':last-child')) {

                    if(animated) {
                        item.hide($this.options.effect, {}, $this.options.effectSpeed, function() {
                            item.appendTo(item.parent()).show($this.options.effect, {}, $this.options.effectSpeed, function() {
                                movedCount++;

                                if(movedCount === itemsCount) {
                                    $this._saveState();
                                }
                            });
                        });
                    }
                    else {
                        item.hide().appendTo(item.parent()).show();
                    }
                }

            });

            if(!animated) {
                this._saveState();
            }
        },
                
        _transfer: function(items, from, to, type) {  
            var $this = this,
            itemsCount = items.length,
            transferCount = 0;

            if(this.options.effect) {
                items.hide(this.options.effect, {}, this.options.effectSpeed, function() {
                    var item = $(this);
                    $this.unselectItem(item);

                    item.appendTo(to).show($this.options.effect, {}, $this.options.effectSpeed, function() {
                        transferCount++;

                        if(transferCount === itemsCount) {
                            $this._saveState();
                            $this._triggerTransferEvent(items, from, to, type);
                        }
                    });
                });
            }
            else {
                items.hide().removeClass('ui-state-highlight ui-state-hover').appendTo(to).show();

                this._saveState();
                this._triggerTransferEvent(items, from, to, type);
            }
        },

        _triggerTransferEvent: function(items, from, to, type) {
            var obj = {};
            obj.items = items;
            obj.from = from;
            obj.to = to;
            obj.type = type;

            this._trigger('transfer', null, obj);
        },
                
        _saveState: function() {
            this.sourceInput.children().remove();
            this.targetInput.children().remove();

            this._generateItems(this.sourceList, this.sourceInput);
            this._generateItems(this.targetList, this.targetInput);
            this.cursorItem = null;
        },
                
        _generateItems: function(list, input) {   
            list.children('.ui-picklist-item').each(function() {
                var item = $(this),
                itemValue = item.data('item-value'),
                itemLabel = item.data('item-label');

                input.append('<option value="' + itemValue + '" selected="selected">' + itemLabel + '</option>');
            });
        },
                
        _setupFilterMatcher: function() {
            this.filterMatchers = {
                'startsWith': this._startsWithFilter,
                'contains': this._containsFilter,
                'endsWith': this._endsWithFilter,
                'custom': this.options.filterFunction
            };

            this.filterMatcher = this.filterMatchers[this.options.filterMatchMode];
        },
                
        _filter: function(value, list) {
            var filterValue = $.trim(value).toLowerCase(),
            items = list.children('li.ui-picklist-item');

            if(filterValue === '') {
                items.filter(':hidden').show();
            }
            else {
                for(var i = 0; i < items.length; i++) {
                    var item = items.eq(i),
                    itemLabel = item.data('item-label');

                    if(this.filterMatcher(itemLabel, filterValue))
                        item.show();
                    else 
                        item.hide();                    
                }
            }
        },

        _startsWithFilter: function(value, filter) {
            return value.toLowerCase().indexOf(filter) === 0;
        },

        _containsFilter: function(value, filter) {
            return value.toLowerCase().indexOf(filter) !== -1;
        },

        _endsWithFilter: function(value, filter) {
            return value.indexOf(filter, value.length - filter.length) !== -1;
        },

        _setOption: function (key, value) {
            $.Widget.prototype._setOption.apply(this, arguments);
            if (key === 'sourceData') {
                this._setOptionData(this.sourceInput, this.sourceList, this.options.sourceData);
            }
            if (key === 'targetData') {
                this._setOptionData(this.targetInput, this.targetList, this.options.targetData);
            }
        },

        _setOptionData: function(input, listContainer, data) {
            input.empty();
            listContainer.empty();
            this._populateInputFromData(input, data);

            this._populateContainerFromOptions(input, listContainer, data);
            this._bindEvents();
        },

        _unbindEvents: function() {
            this.items.off("mouseover.puipicklist mouseout.puipicklist click.puipicklist dblclick.pickList");
        },

        disable: function () {
            this._unbindEvents();
            this.items.addClass('ui-state-disabled');
            this.element.find('.ui-picklist-buttons > button').each(function (idx, btn) {
                $(btn).puibutton('disable');
            });
        },

        enable: function () {
            this._bindEvents();
            this.items.removeClass('ui-state-disabled');
            this.element.find('.ui-picklist-buttons > button').each(function (idx, btn) {
                $(btn).puibutton('enable');
            });
        },
        
        _createItemContent: function(choice) {
            if(this.options.template) {
                var template = this.options.template.html();
                Mustache.parse(template);
                return Mustache.render(template, choice);
            }
            else if(this.options.content) {
                return this.options.content.call(this, choice);
            }
            else {
                return choice.label;
            }
        }
    });
        
})();