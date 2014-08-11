// Copyright 2013 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @author smckay@google.com (Steve McKay)
 * @author tbreisacher@google.com (Tyler Breisacher)
 */

goog.provide('analytics.Timing');
goog.provide('analytics.Tracker');
goog.provide('analytics.Tracker.Hit');
goog.provide('analytics.Tracker.HitEvent');

goog.require('analytics.HitType');
goog.require('analytics.Parameter');
goog.require('analytics.Value');

goog.require('goog.events.EventTarget');



/**
 * Provides support for sending hits to Google Analytics using convenient
 * named methods like {@code sendAppView} and {@code sendEvent} or the
 * general purpose {@code send} method.
 *
 * <p>Clients can set session values using {@code set}. These values, once set,
 * are included in all subsequent hits.
 *
 * <p>For analytics hittypes that are not supported by a named method clients
 * can call {@code send} with param/value {@code Object} describing the hit.
 *
 * Obtain a instance using the {@code analytics.Service#getTracker}.
 *
 * @interface
 */
analytics.Tracker = function() {};


/**
 * Sets an individual value on the {@code Tracker}, replacing any previously
 * set values with the same param. The value is persistent for the life
 * of the {@code Tracker} instance, or until replaced with another call
 * to {@code set}.
 *
 * @param {!analytics.Parameter|string} param
 * @param {!analytics.Value} value
 */
analytics.Tracker.prototype.set;


/**
 * Sends a hit to Google Analytics. Caller is responsible for ensuring the
 * of the information sent with that hit. Values can be provided either
 * using {@code set} or using {@code opt_extraParams}.
 *
 * <p>Whenever possible use a named method like {@code sendAppView} or
 * {@code sendEvent}.
 *
 * @param {!analytics.HitType} hitType
 * @param {!Object=} opt_extraParams An optional object containing
 *     {@code string} / {@code !analytics.Value} pairs
 *     to send with the hit. The values are NOT persisted in the tracker.
 * @return {!goog.async.Deferred}
 */
analytics.Tracker.prototype.send;


/**
 * Sends an AppView hit to Google Analytics.
 *
 * @param {string} description A unique description of the "screen" (
 *     or "place, or "view") within your application. This is should more
 *     specific than your app name, but generally not include any runtime
 *     data. In most cases all "screens" should be known at the time
 *     the app is built. Examples: "MainScreen" or "SettingsView".
 * @return {!goog.async.Deferred}
 */
analytics.Tracker.prototype.sendAppView;


/**
 * Sends an Event hit to Google Analytics.
 *
 * @param {string} category Specifies the event category.
 * @param {string} action Specifies the event action.
 * @param {string=} opt_label Specifies the event label.
 * @param {number=} opt_value Specifies the event value.
 *     Values must be non-negative.
 * @return {!goog.async.Deferred}
 */
analytics.Tracker.prototype.sendEvent;


/**
 * Sends a Social hit to Google Analytics.
 *
 * @param {string} network Specifies the social network, for example Facebook
 *     or Google Plus.
 * @param {string} action Specifies the social interaction action.
 *     For example on Google Plus when a user clicks the +1 button,
 *     the social action is 'plus'.
 * @param {string} target Specifies the target of a social interaction.
 *     This value is typically a URL but can be any text.
 * @return {!goog.async.Deferred}
 */
analytics.Tracker.prototype.sendSocial;


/**
 * Sends an Exception hit to Google Analytics.
 *
 * @param {string=} opt_description Specifies the description of an exception.
 * @param {boolean=} opt_fatal Was the exception fatal.
 * @return {!goog.async.Deferred}
 */
analytics.Tracker.prototype.sendException;


/**
 * Sends a Timing hit to Google Analytics.
 *
 * @see analytics.Tracker.startTiming for another handy way to send
 *     timing events.
 *
 * @param {string} category Specifies the category of the timing.
 * @param {string} variable Specifies the variable name of the timing.
 * @param {number} value Specifies the value of the timing.
 * @param {string=} opt_label Specifies the optional label of the timing.
 * @param {number=} opt_sampleRate
 * @return {!goog.async.Deferred}
 */
analytics.Tracker.prototype.sendTiming;


/**
 * Forces the tracker up to start a new session on the next hit.  Note that
 * clients should not usually need to call this as Google Analytics provides
 * automatic session management.
 */
analytics.Tracker.prototype.forceSessionStart;


/**
 * Creates a new timing object that tracks elapsed time for you.
 *
 * @see analytics.Tracker.sendTiming for a way to send timing events
 *     where callers supply the timing value.
 *
 * @param {string} category
 * @param {string} variable
 * @param {string=} opt_label
 * @param {number=} opt_sampleRate
 * @return {!analytics.Tracker.Timing}
 */
analytics.Tracker.prototype.startTiming;



/**
 * Provides support for timing operations and sending the results to
 * Google Analytics.
 *
 * Obtain an instance using {@code analytics.Service#createTimer}.
 *
 * @interface
 */
analytics.Tracker.Timing = function() {};


/**
 * Calculates the final timing and sends the information to Google Analytics.
 *
 * @return {!goog.async.Deferred}
 */
analytics.Tracker.Timing.prototype.send;


/**
 * @deprecated Use {@code analytics.Tracker#addFilter}
 *
 * @return {!goog.events.EventTarget} An event target that emits events for each
 *     hit that is "sent" via the tracker. Events will only be published when
 *     analytics reporting is enabled.
 */
analytics.Tracker.prototype.getEventTarget;


/**
 * Adds a {@code analytics.Tracker.Filter} to the request
 * handling pipeline. The filter will be called once for each hit,
 * immediately after the hit is sent.
 *
 * <li>Filters will not be applied when tracking is disabled by the user.
 * <li>Filters are applied in the order they are added.
 *
 * @param {!analytics.Tracker.Filter} filter
 */
analytics.Tracker.prototype.addFilter;


/**
 * A {@code function} that processes a hit.
 *
 * @typedef {function(!analytics.Tracker.Hit)}
 */
analytics.Tracker.Filter;



/**
 * A mutable representation of a hit being sent by client code.
 * This is the payload given to filters, and the means by which
 * a filter can manipulate or terminate ("cancel") a hit.
 *
 * @constructor
 * @struct
 *
 * @param {!analytics.HitType} type
 * @param {!analytics.ParameterMap} parameters
 */
analytics.Tracker.Hit = function(type, parameters) {
  /** @private {!analytics.HitType} */
  this.type_ = type;

  /** @private {!analytics.ParameterMap} */
  this.parameters_ = parameters;

  /** @private {boolean} */
  this.canceled_ = false;
};


/** @return {!analytics.HitType} */
analytics.Tracker.Hit.prototype.getHitType = function() {
  return this.type_;
};


/**
 * @return {!analytics.ParameterMap} A map of the individual parameters
 *     and their values.
 */
analytics.Tracker.Hit.prototype.getParameters = function() {
  return this.parameters_;
};


/**
 * Marks the hit as canceled. The hit will endure no further
 * processing once it has been marked as canceled.
 */
analytics.Tracker.Hit.prototype.cancel = function() {
  this.canceled_ = true;
};


/**
 * @return {boolean} True if the hit was canceled by the previous
 *     filter. A filter will never be given a previously canceled hit.
 */
analytics.Tracker.Hit.prototype.canceled = function() {
  return this.canceled_;
};



/**
 * An event that is sent whenever a hit is recorded.
 *
 * @constructor
 * @extends {goog.events.Event}
 * @deprecated Use {@code analytics.Tracker#addFilter}
 *
 * @param {!analytics.Tracker.Hit} hit
 */
analytics.Tracker.HitEvent = function(hit) {
  goog.base(this, analytics.Tracker.HitEvent.EVENT_TYPE);

  /** @private {!analytics.Tracker.Hit} */
  this.hit_ = hit;
};
goog.inherits(analytics.Tracker.HitEvent, goog.events.Event);


/** @return {!analytics.HitType} */
analytics.Tracker.HitEvent.prototype.getHitType = function() {
  return this.hit_.getHitType();
};


/**
 * @return {!Object.<string, analytics.Value>}
 *     An object representation of the hit data.
 */
analytics.Tracker.HitEvent.prototype.getHit = function() {
  return this.hit_.getParameters().toObject();
};


/**
 * @deprecated Use {@code analytics.Tracker#addFilter}
 * @const {string} The event type for {@code analytics.Tracker.HitEvent}.
 */
analytics.Tracker.HitEvent.EVENT_TYPE = goog.events.getUniqueId('HitEvent');

