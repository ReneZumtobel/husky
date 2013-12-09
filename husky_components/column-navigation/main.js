/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * Name: column navigation
 * Options:
 *
 * Emits:
 *  husky.column.navigation.initialized
 *  husky.column.navigation.data.loaded
 *  husky.column.navigation.selected
 *
 * Listens:
 */

define([], function() {

    'use strict';

    var defaults = {
        wrapper: {
            height: "300px"
        },
        column: {
            width: "200px"
        },
        url: null
    };

    return {

        initialize: function() {

            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            this.columns = [];

            this.render();
            this.load(this.options.url, null);
            this.bindDOMEvents();

        },

        /**
         * Renders basic structure (wrapper) of column navigation
         */
        render: function() {

            this.$container = this.sandbox.dom.$('<div/>');
            this.sandbox.dom.addClass(this.$container, 'column-navigation');
            this.sandbox.dom.css(this.$container, 'height', this.options.wrapper.height);

            this.$element = this.sandbox.dom.$(this.options.el);
            this.sandbox.dom.append(this.$element, this.$container);

            // TODO
            // add and settings button
        },

        /**
         * Loads data from a specific url and triggers the parsing
         */
        load: function(url, columnNumber) {

            if(!!this.options.url) {

                this.sandbox.util.ajax({

                    url: url,

                    error: function(jqXHR, textStatus, errorThrown) {
                        this.sandbox.logger.log("An error occured while fetching data from: " + this.options.url);
                        this.sandbox.logger.log("errorthrown",errorThrown.message);
                    }.bind(this),

                    success: function(response) {

                        this.parseData(response, columnNumber);
                        this.sandbox.emit('husky.column.navigation.loaded');

                    }.bind(this)
                });
            } else {
                this.sandbox.logger.log("husky.column.navigation - invalid url, aborted loading of data");
            }
        },

        /**
         * Parses the received data and renders first column
         */
        parseData: function(data, columnNumber){

            this.data = {};
            this.data.links = data._links;
            this.data.embedded = data._embedded;
            this.data.title = data.title;
            this.data.id = data.id;
            this.data.hasSub = data.hasSub;


            if (!columnNumber && !this.columns[columnNumber]){  // case 1: no elements in container

                var $column,
                    $list;

                $column = this.sandbox.dom.$(this.template.column('1', this.options.wrapper.height));
                $list = this.sandbox.dom.find('ul', $column);

                this.sandbox.util.each(this.data.embedded, function(index,value){
                    this.sandbox.dom.append($list, this.sandbox.dom.$(this.template.item(value)));
                }.bind(this));

                this.sandbox.dom.append(this.$container, $column);


            } else { // case 2: columns in container replace level after clicked column and clear following levels
                this.sandbox.logger.log("not yet implemented!");
                // TODO
            }

        },


        bindDOMEvents: function(){
            this.sandbox.dom.on(this.$el, 'click', this.itemSelected.bind(this), 'li');

        },

        itemSelected: function(event){

            // TODO
            // select element - deselect old in same column if set
            // remove old subcolumns
            // reload
            // add new columns

            var $target = this.sandbox.dom.$(event.currentTarget),
                id = this.sandbox.dom.data($target, 'id'),
                selectedItem = null,
                column = this.sandbox.dom.data(
                            this.sandbox.dom.parent(
                                this.sandbox.dom.parent($target)), 'column');


            this.sandbox.emit('husky.column.navigation.selected', id, event);

            this.sandbox.util.each(this.data.embedded, function(index,value) {
                if(parseInt(value.id, 10) === id) {
                    selectedItem = value;
                    return false;
                }
            }.bind(this));

            if(!!selectedItem) {
                this.load(selectedItem._links.children, column);
            } else {
                this.sandbox.logger.log("invalid id");
            }
        },

        template : {
            column : function (columnNumber, height){
                return ['<div class="column pull-left" style="height:',height,'" data-column="',columnNumber,'"><ul></ul></div>'].join('');
            },

            item : function (data){

                var item = ['<li data-id="',data.id,'" class="pointer">'];

                // TODO
                // has status (online, offline, ghost, shadow, linked)

                // TODO
                // is editable, is selected, is ghost

                item.push('<span class="column-navigation-item-text pull-left">',data.title,'</span>');

                if(!!data.hasSub) {
                    item.push('<span class="column-navigation-item-icons-right pull-right">',
                        '<span class="icon-chevron-right"></span>',
                        '</span></li>');
                }

                return item.join('');
            }
        }



    };
});
