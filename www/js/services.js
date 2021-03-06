angular.module('my.services', ['ngRoute','my.controllers', 'my.routes'])

.service('AuthService', function($q, $http, API_ENDPOINT) {
  var LOCAL_TOKEN_KEY = 'token';
  var isAuthenticated = false;
  var authToken;

  function getToken() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      useToken(token);
    }
  }

  function setToken(token) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    useToken(token);
  }

  function useToken(token) {
    isAuthenticated = true;
    authToken = token;

    // Set the token as header for your requests!
    $http.defaults.headers.common.Authorization = authToken;
  }

  function deleteToken() {
    authToken = undefined;
    isAuthenticated = false;
    $http.defaults.headers.common.Authorization = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  var register = function(user) {
    return $q(function(resolve, reject) {
      $http.post(API_ENDPOINT.url + '/signup', user).then(function(result) {
        if (result.data.success) {
          resolve(result.data.msg);
        } else {
          reject(result.data.msg);
        }
      });
    });
  };

  var login = function(user) {
    return $q(function(resolve, reject) {
      $http.post(API_ENDPOINT.url + '/authenticate', user).then(function(result) {
        if (result.data.success) {
          setToken(result.data.token);
          resolve(result.data.msg);
        } else {
          console.log('to see');
          reject(result.data.msg);
        }
      });
    });
  };

  var logout = function() {
    deleteToken();
  };

  getToken();

  return {
    login: login,
    register: register,
    logout: logout,
    isAuthenticated: function() {return isAuthenticated;},
  };
})

.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
      }[response.status], response);
      return $q.reject(response);
    }
  };
})

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});
