<?php

use App\Http\Controllers\Booking\ApplyCouponController;
use App\Http\Controllers\Booking\AvailabilityController;
use App\Http\Controllers\Booking\ConfirmPayAtPropertyController;
use App\Http\Controllers\Booking\CreateHoldController;
use App\Http\Controllers\Booking\SelectPaymentMethodController;
use App\Http\Controllers\Booking\SendPhoneVerificationController;
use App\Http\Controllers\Booking\StartPaymentController;
use App\Http\Controllers\Booking\VerifyPhoneVerificationController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/booking/availability', AvailabilityController::class)
    ->name('booking.availability');

Route::post('/booking/hold', CreateHoldController::class)
    ->name('booking.hold');

Route::post(
    '/booking/{booking}/phone-verification/send',
    SendPhoneVerificationController::class
)->name('booking.phone-verification.send');

Route::post(
    '/booking/{booking}/phone-verification/verify',
    VerifyPhoneVerificationController::class
)->name('booking.phone-verification.verify');

Route::post(
    '/booking/{booking}/coupon',
    ApplyCouponController::class
)->name('booking.coupon.apply');

Route::post(
    '/booking/{booking}/payment-method',
    SelectPaymentMethodController::class
)->name('booking.payment-method.select');

Route::post(
    '/booking/{booking}/confirm-pay-at-property',
    ConfirmPayAtPropertyController::class
)->name('booking.pay-at-property.confirm');

Route::post(
    '/booking/{booking}/payment/start',
    StartPaymentController::class
)->name('booking.payment.start');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';