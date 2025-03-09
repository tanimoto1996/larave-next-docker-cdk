<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return view('welcome');
});

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// 認証必須のルートは sanctum/web ミドルウェアを通す
Route::middleware('auth')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
});
