<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Services\AvailabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class AvailabilityController extends Controller
{
    public function __invoke(
        Request $request,
        AvailabilityService $availabilityService,
    ): JsonResponse {
        $validated = $request->validate([
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'check_in' => ['required', 'date_format:Y-m-d'],
            'check_out' => ['required', 'date_format:Y-m-d'],
        ]);

        try {
            $results = $availabilityService->search(
                (int) $validated['branch_id'],
                $validated['check_in'],
                $validated['check_out'],
            );
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages([
                'check_out' => [$exception->getMessage()],
            ]);
        }

        return response()->json([
            'data' => $results,
        ]);
    }
}