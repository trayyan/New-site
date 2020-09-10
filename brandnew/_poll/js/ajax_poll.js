/*js
//==>>>==>>>==>>>==>>>==>>>==>>>==>>>==>>>==>>>==>>>==>>>==>>>==>>>
//
// Ajax Poll DX v1.01
// Copyright (c) phpkobo.com ( http://www.phpkobo.com/ )
// Email : admin@phpkobo.com
// ID : PX201-101
//
// This software is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; version 2 of the
// License.
//
// [Installation Guide]
// http://www.phpkobo.com/doc.php?d=install&p=PX201-101
//
//==<<<==<<<==<<<==<<<==<<<==<<<==<<<==<<<==<<<==<<<==<<<==<<<==<<<
*/

(function($){

var MSG_THANK_YOU = "THANK YOU FOR VOTING!";
var MSG_CANT_VOTE = "YOU'VE ALREADY VOTED!";
var MSG_SELECT_ONE = "PLEASE MAKE A SELECTION!";

//-----------------------------------------------
// showTip
//-----------------------------------------------
var period_tip_window = 3000;
function showTip( obj, txt, bgcolor )
{
	txt = typeof txt !== 'undefined' ? txt : "Saved！";
	bgcolor = typeof bgcolor !== 'undefined' ? bgcolor : "#ffffff";

	var tip_box = obj.find( 'span[ttype="tip_box"]' ).clone();
	if ( !tip_box.length )
	{
		var s = '';
		s += "<span ";
		s += "style='";
		s += "text-align:center;";
		s += "padding:10px;";
		s += "margin:10px;";
		s += "font-family:Arial;";
		s += "font-size:10px;";
		s += "font-weight:bold;";
		s += "letter-spacing:.1em;";
		s += "font-style:normal;";
		s += "color:rgb(255,255,255);";
		s += "z-index:10;";
		s += "position:relative;";
		s += "background-color:rgb(255,0,0);";
		s += "'>";
		s += txt;
		s += "</span>";
		tip_box = $( s );
	}

	tip_box.css({
		"position":"absolute",
		"left":"0px",
		"top":"0px",
	});

	tip_box.appendTo( $( 'body' ) );
	tip_box.show();

	wt = tip_box.outerWidth(false);
	ht = tip_box.outerHeight(true);

	var x = obj.offset().left;
	var y = obj.offset().top;
	var w = obj.width();
	var h = obj.height();

	var ytd = 10;
	var xt = x + w/2 - wt/2;
	var yt = y - ht;

	tip_box.css( { "left":xt + "px", "top":yt + "px" } );
	tip_box.fadeOut( period_tip_window, function() {
	    tip_box.remove();
	});
}

//----------------------------------------------------------------
// CWaitIcon
//----------------------------------------------------------------
function CWaitIcon( url_img )
{
	var s = '';
	s += "<img ";
	s += "src='" + url_img + "'";
	s += ">";
	this.img = $( s );

	this.img.css({
		"position":"absolute",
		"z-index":"10",
		"left":"-10000px",
		"top":"-10000px",
		"width":"64px",
		"height":"64px"
	});

	this.img.hide();
	this.img.appendTo( $( 'body' ) );
}

CWaitIcon.prototype =
{
	show : function( e )
	{
		var w = 32;
		var h = 32;
		this.img.css( { "left":(e.pageX - w/2) + "px",
			"top":(e.pageY - h/2) + "px" } );
		this.img.show();
	},

	hide : function()
	{
		this.img.hide();
	}
}

//----------------------------------------------------------------
// CCookie
//----------------------------------------------------------------
function CCookie()
{
}

CCookie.prototype =
{
	set : function( name, value, hours )
	{
		hours = hours || 24;
		var date = new Date();
		date.setTime( date.getTime() + ( hours*60*60*1000 ) );
		var expires = "; expires="+date.toGMTString();

		document.cookie = name + "=" + value + expires + "; path=/";
	},

	get : function( name )
	{
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0; i < ca.length; i++ )
		{
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	},

	del : function( name )
	{
		document.cookie = name + '=; expires=Fri, 3 Aug 2001 20:47:11 UTC; path=/';
	}
}

var Cookie = new CCookie();

//----------------------------------------------------------------
// CAjaxPoll
//----------------------------------------------------------------
function CAjaxPoll( domobj )
{
	this.domobj = domobj;
	this.form = $( domobj );
	this.id = this.getAttr( 'id', domobj );
	this.b_front = true;
	var action = this.getAttr( 'action', domobj );
	this.url_server = action;
	var pos = action.lastIndexOf("/");
	var url_image = 'wait.gif';
	if ( pos != -1 )
	{
		var path = action.substring( 0, pos+1 );
		url_image = path + 'images/' + url_image;
	}
	this.wait_icon = new CWaitIcon( url_image );
}

CAjaxPoll.prototype =
{
	//-----------------------------------------------
	// getAttr
	//-----------------------------------------------
	getAttr : function( id_name, obj )
	{
		if (
			( typeof( $( obj ).attr( id_name ) ) == 'undefined' ) || 
			( $( obj ).attr( id_name ) == '' ) // for Opera
		) return null;
		return $( obj ).attr( id_name );
	},

	//-----------------------------------------------
	// getCookieName
	//-----------------------------------------------
	getCookieName : function()
	{
		return 'ajax_poll_' + this.id;
	},

	//-----------------------------------------------
	// checkCookie
	//-----------------------------------------------
	checkCookie : function()
	{
		var key = this.getCookieName();
		var s = Cookie.get( key );
		if ( s == null )
		{
			Cookie.set( key, 'yes' );
			return true;
		}
		else
			return false;
	},

	//-----------------------------------------------
	// send
	//-----------------------------------------------
	send : function( item_id )
	{
		var _this = this;
		$.post( this.url_server,
			{ cmd: "vote", form_id:this.id, item_id:item_id },
			function(data) {
				_this.wait_icon.hide();
				var res = eval('(' + data + ')');
				if ( res.result == 'OK' )
				{
					_this.items = res.items;
					_this.displayStats();
				}
				else
				{
					alert( res.result );
				}
		});
	},

	//-----------------------------------------------
	// run
	//-----------------------------------------------
	run : function()
	{
		var _this = this;

		//-- [BEGIN] Row mouse over
		this.form.find( '.ajax-poll-item' ).mouseover( function() {
			$( this ).addClass( "ajax-poll-item-mover" );
		}).mouseout( function() {
			$( this ).removeClass( "ajax-poll-item-mover" );
		});
		//-- [END] Row mouse over

		//-- [BEGIN] Setup radio buttons
		this.form.find( '.ajax-poll-item' ).each( function(){
			var form_id = _this.id;
			var item_id = $(this).attr( 'id' );
			var radio = $(this).find( '.ajax-poll-item-radio' ).eq(0);
			radio.attr( 'name', form_id );
			radio.attr( 'value', item_id );
		});
		//-- [END] Setup radio buttons

		//-- [BEGIN] Select an item
		this.form.find( '.ajax-poll-item' ).click( function(e){
			e.preventDefault();
			if ( !_this.b_front ) return;

			var id = $(this).attr( 'id' );
			var radio = $(this).find( 'input[value="' + id + '"]' );
			radio.attr( 'checked', 'checked' );

			_this.form.find( '.ajax-poll-item' )
				.removeClass( "ajax-poll-item-sel" );
			$(this).addClass( "ajax-poll-item-sel" );
		});
		//-- [END] Select an item

		//-- [BEGIN] Vote
		this.form.find( '.ajax-poll-btn-vote' ).click( function(e){
			e.preventDefault();

			var form = $(this).parents( '.ajax-poll-form' ).eq(0);

			var item_id = form.find( 'input[name="' + _this.id + '"]:checked').val();
			if ( typeof(item_id) == 'undefined' ) item_id = '';

			if ( item_id == '' )
			{
				showTip( form.find( '.ajax-poll-vote-box' ),
					MSG_SELECT_ONE, "#ff0000" );
				return 
			}
			else
			{
				if ( _this.checkCookie() )
				{
					showTip( form.find( '.ajax-poll-vote-box' ),
						MSG_THANK_YOU );
				}
				else
				{
					showTip( form.find( '.ajax-poll-vote-box' ),
						MSG_CANT_VOTE, "#ff0000" );
					return;
				}
			}

			_this.b_front = false;

			form.find( '.ajax-poll-item-desc-box' ).hide();

			form.find( '.ajax-poll-item-bar' ).css( 'width', 0 );
			form.find( '.ajax-poll-item-count' ).html( '' );
			form.find( '.ajax-poll-item-perc' ).html( '' );
			form.find( '.ajax-poll-item-stats-box' ).show();

			form.find( '.ajax-poll-vote-box' ).hide();
			form.find( '.ajax-poll-back-box' ).show();

			form.find( '.ajax-poll-item-radio' ).hide();

			_this.vote( e, item_id );
		});
		//-- [END] Vote

		//-- [BEGIN] View result
		this.form.find( '.ajax-poll-btn-view' ).click( function(e){
			e.preventDefault();
			_this.b_front = false;

			var form = _this.form;
			form.find( '.ajax-poll-item-desc-box' ).hide();

			form.find( '.ajax-poll-item-bar' ).css( 'width', 0 );
			form.find( '.ajax-poll-item-count' ).html( '' );
			form.find( '.ajax-poll-item-perc' ).html( '' );
			form.find( '.ajax-poll-item-stats-box' ).show();

			form.find( '.ajax-poll-vote-box' ).hide();
			form.find( '.ajax-poll-back-box' ).show();

			form.find( '.ajax-poll-item-radio' ).hide();

			_this.vote( e, '' );
		});
		//-- [END] View result

		//-- [BEGIN] Go Back
		this.form.find( '.ajax-poll-btn-back' ).click( function(e){
			e.preventDefault();
			_this.b_front = true;

			var form = _this.form;
			form.find( '.ajax-poll-item-desc-box' ).show();
			form.find( '.ajax-poll-item-stats-box' ).hide();

			form.find( '.ajax-poll-vote-box' ).show();
			form.find( '.ajax-poll-back-box' ).hide();

			form.find( '.ajax-poll-item-radio' ).hide();
		});
		//-- [END] Go Back

		//-- [BEGIN] Reset cookie
		this.form.next( '.ajax-poll-btn-reset' ).click( function(e){
			e.preventDefault();
			Cookie.del( _this.getCookieName() );
			alert( "Cookie has been reset!" );
		});
		//-- [END] Reset cookie
	},

	//-----------------------------------------------
	// vote
	//-----------------------------------------------
	vote : function( e, item_id )
	{
		this.wait_icon.show(e);
		this.send( item_id );
	},

	//-----------------------------------------------
	// displayStats
	//-----------------------------------------------
	displayStats : function()
	{
		var _this = this;

		//-- [BEGIN] Calculate total & Find max count
		var total = 0;
		var max_cnt = 0;
		this.form.find( '.ajax-poll-item' ).each( function(){
			var item_id = $(this).attr( 'id' );
			var cnt = 0;
			if ( typeof(_this.items[item_id]) != 'undefined' )
			{
				cnt = _this.items[item_id];
			}
			else
			{
				_this.items[item_id] = cnt;
			}
			if ( max_cnt < cnt ) max_cnt = cnt;
			total += cnt;
		});
		this.form.find( '.ajax-poll-total-value' ).html( total.toString() + ' vote'
				+ ( total == 1 ? '' : 's' ) );
		//-- [END] Calculate total & Find max count

		//-- [BEGIN] Find max width
		var max_w = this.form
			.find( '.ajax-poll-item' )
			.eq(0)
			.width();
		max_w = parseInt( max_w );
		//-- [END] Find max width

		//-- [BEGIN] Show counts, percentage, and bar
		this.form.find( '.ajax-poll-item' ).each( function(){
			var id = $(this).attr( 'id' );
			var cnt = ( typeof(_this.items[id]) == 'undefined' ) ?
				0 : _this.items[id];
			var perc = ( total > 0 ) ?
				( ( cnt * 100 ) / total ) : 0;

			$(this).find( '.ajax-poll-item-count' ).html( cnt.toString() + ' vote'
				+ ( cnt == 1 ? '' : 's' ) );
			$(this).find( '.ajax-poll-item-perc' ).html( perc.toFixed(1) + '%' );

			if ( max_cnt > 0 )
			{
				var w = (( cnt * max_w ) / max_cnt) / 2 + "px";
				var bar = $(this).find( '.ajax-poll-item-bar' );
				bar.css( 'width', 0 );
				bar.animate({
					width: w
				}, 1000 );
			}
		});
		//-- [END] Show counts, percentage, and bar
	}
}

//----------------------------------------------------------------
// ready
//----------------------------------------------------------------
$(document).ready(function() {
	$( '.ajax-poll-form' ).each( function(){
		var obj = new CAjaxPoll( this ); 
		obj.run();
	});
});

}(jQuery));
