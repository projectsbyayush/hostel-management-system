$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8080/api'
$pass = 0; $fail = 0

# Admin credentials are read from backend/.env (same source the backend uses).
$adminUsername = 'admin'
$adminPassword = 'admin123'
$envFile = Join-Path $PSScriptRoot '..\backend\.env'
if (Test-Path $envFile) {
  foreach ($line in Get-Content $envFile) {
    if ($line -match '^\s*ADMIN_USERNAME\s*=\s*(.+?)\s*$') { $adminUsername = $Matches[1] }
    if ($line -match '^\s*ADMIN_PASSWORD\s*=\s*(.+?)\s*$') { $adminPassword = $Matches[1] }
  }
}

function Check($name, $cond, $detail = '') {
  if ($cond) { $script:pass++; "PASS  $name" }
  else { $script:fail++; "FAIL  $name  $detail" }
}

function Req($method, $path, $token, $body) {
  try {
    $hdrs = @{}
    if ($token) { $hdrs['Authorization'] = "Bearer $token" }
    if ($body) {
      $json = $body | ConvertTo-Json -Depth 5
      return Invoke-RestMethod -Uri "$base$path" -Method $method -ContentType 'application/json' -Headers $hdrs -Body $json -TimeoutSec 15
    }
    return Invoke-RestMethod -Uri "$base$path" -Method $method -Headers $hdrs -TimeoutSec 15
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
      $txt = $sr.ReadToEnd()
      return @{ __error = $true; __status = [int]$resp.StatusCode; __body = $txt }
    }
    return @{ __error = $true; __status = 0; __body = $_.Exception.Message }
  }
}

# ---- 1. Auth ----
$login = Req Post '/auth/login' $null @{ usernameOrEmail = $adminUsername; password = $adminPassword }
Check 'login with username' (-not $login.__error -and $login.token) ($login | ConvertTo-Json -Compress)
$token = $login.token

$badLogin = Req Post '/auth/login' $null @{ usernameOrEmail = $adminUsername; password = 'wrong' }
Check 'login rejects wrong password' ($badLogin.__error -and $badLogin.__status -eq 401) ($badLogin | ConvertTo-Json -Compress)

$unauth = Req Get '/dashboard/stats' $null
Check 'dashboard requires auth (401)' ($unauth.__error -and $unauth.__status -eq 401) ($unauth | ConvertTo-Json -Compress)

# ---- 2. Dashboard ----
$stats = Req Get '/dashboard/stats' $token
Check 'dashboard stats shape' ($stats.totalStudents -eq 16 -and $stats.totalRooms -eq 7 -and $stats.availableBeds -eq 4) ($stats | ConvertTo-Json -Compress)
$occ = Req Get '/dashboard/room-occupancy' $token
Check 'room occupancy rows' ($occ.Count -eq 7 -and ($occ | Where-Object { $_.roomNumber -eq '201' }).occupied -eq 2) ($occ | ConvertTo-Json -Compress)
$col = Req Get '/dashboard/monthly-collections' $token
Check 'monthly collections 6 months' ($col.Count -eq 6 -and $col[0].month -ne $null) ($col | ConvertTo-Json -Compress)
$recent = Req Get '/dashboard/recent-students' $token
Check 'recent students returned' ($recent.Count -eq 5) ''
$pc = Req Get '/dashboard/pending-complaints' $token
Check 'pending complaints returned' ($pc.Count -eq 4) ''

# ---- 3. Students ----
$students = Req Get '/students' $token
Check 'students list = 16' ($students.Count -eq 16) ''
$search = Req Get '/students?q=Aarav' $token
Check 'student search by name' ($search.Count -eq 1 -and $search[0].fullName -eq 'Aarav Sharma') ''
$search2 = Req Get '/students?q=STU-2026-003' $token
Check 'student search by ID' ($search2.Count -eq 1 -and $search2[0].studentId -eq 'STU-2026-003') ''
$inactive = Req Get '/students?status=INACTIVE' $token
Check 'student filter inactive' ($inactive.Count -eq 1) ''

$newStudent = @{ studentId = 'STU-2026-017'; fullName = 'Test Student'; email = 'test.student@mail.com'; phone = '9876500017'; course = 'B.Tech Computer Science'; yearOfStudy = 1; guardianName = 'Test Guardian'; guardianContact = '9876500027'; address = 'Test Address'; admissionDate = '2026-09-01'; status = 'ACTIVE' }
$created = Req Post '/students' $token $newStudent
Check 'create student' (-not $created.__error -and $created.studentId -eq 'STU-2026-017') ($created | ConvertTo-Json -Compress)

$dup = Req Post '/students' $token $newStudent
Check 'duplicate student ID rejected (409)' ($dup.__error -and $dup.__status -eq 409) ($dup | ConvertTo-Json -Compress)

$invalid = Req Post '/students' $token (@{ studentId = ''; fullName = ''; email = 'nope'; phone = '1'; course = ''; yearOfStudy = 0; guardianName = ''; guardianContact = ''; admissionDate = '2027-01-01'; status = 'ACTIVE' })
$invalidBody = $invalid.__body | ConvertFrom-Json
Check 'student validation errors (400)' ($invalid.__error -and $invalid.__status -eq 400 -and $invalidBody.details.Count -ge 4) ($invalid | ConvertTo-Json -Compress -Depth 5)

$updBody = $newStudent.Clone()
$updBody['fullName'] = 'Test Student Updated'
$updated = Req Put "/students/$($created.id)" $token $updBody
Check 'update student' (-not $updated.__error -and $updated.fullName -eq 'Test Student Updated') ($updated | ConvertTo-Json -Compress)

$del = Req Delete "/students/$($created.id)" $token
Check 'delete student without records succeeds' (-not $del.__error) ($del | ConvertTo-Json -Compress)

$delBlocked = Req Delete '/students/1' $token
Check 'delete student with records blocked (409)' ($delBlocked.__error -and $delBlocked.__status -eq 409) ($delBlocked | ConvertTo-Json -Compress)

# ---- 4. Rooms ----
$rooms = Req Get '/rooms' $token
Check 'rooms list = 7' ($rooms.Count -eq 7) ''
$fullRooms = Req Get '/rooms?status=FULL' $token
Check 'derived FULL filter' ($fullRooms.Count -eq 3 -and ($fullRooms | Where-Object { $_.roomNumber -eq '201' })) ($fullRooms | ConvertTo-Json -Compress)
$partialRooms = Req Get '/rooms?status=PARTIAL' $token
Check 'derived PARTIAL filter' ($partialRooms.Count -eq 2) ($partialRooms | ConvertTo-Json -Compress)
$maintRooms = Req Get '/rooms?status=MAINTENANCE' $token
Check 'MAINTENANCE filter' ($maintRooms.Count -eq 1 -and $maintRooms[0].roomNumber -eq '302') ''

$newRoom = @{ roomNumber = '501'; floorNo = 5; roomType = 'DOUBLE'; capacity = 2; monthlyFee = 5000; status = 'AVAILABLE' }
$roomCreated = Req Post '/rooms' $token $newRoom
Check 'create room' (-not $roomCreated.__error -and $roomCreated.roomNumber -eq '501') ($roomCreated | ConvertTo-Json -Compress)

$capBody = $newRoom.Clone()
$capBody['capacity'] = 1
$capReduce = Req Put "/rooms/$($roomCreated.id)" $token $capBody
Check 'new room capacity can reduce (no allocations)' (-not $capReduce.__error -and $capReduce.capacity -eq 1) ''

$room201 = $rooms | Where-Object { $_.roomNumber -eq '201' }
$capBlocked = Req Put "/rooms/$($room201.id)" $token (@{ roomNumber = '201'; floorNo = 2; roomType = 'DOUBLE'; capacity = 1; monthlyFee = 4500; status = 'AVAILABLE' })
Check 'reduce capacity below occupancy blocked (409)' ($capBlocked.__error -and $capBlocked.__status -eq 409) ($capBlocked | ConvertTo-Json -Compress)

$dupRoom = Req Post '/rooms' $token $newRoom
Check 'duplicate room number rejected (409)' ($dupRoom.__error -and $dupRoom.__status -eq 409) ''

$roomDelBlocked = Req Delete "/rooms/$($room201.id)" $token
Check 'delete room with allocations blocked (409)' ($roomDelBlocked.__error -and $roomDelBlocked.__status -eq 409) ''

$roomDel = Req Delete "/rooms/$($roomCreated.id)" $token
Check 'delete empty room succeeds' (-not $roomDel.__error) ''

# ---- 5. Allotments ----
$active = Req Get '/allocations?status=ACTIVE' $token
Check 'active allotments = 9' ($active.Count -eq 9) ''
$history = Req Get '/allocations?status=CHECKED_OUT' $token
Check 'checked-out history = 2' ($history.Count -eq 2) ''

# student STU-2026-012 (Sneha) has no active allocation; room 102 has 1 free bed
$sneha = (Req Get '/students?q=Sneha' $token)[0]
$room102 = $rooms | Where-Object { $_.roomNumber -eq '102' }
$allot = Req Post '/allocations' $token @{ studentId = $sneha.id; roomId = $room102.id; allotmentDate = '2026-10-11' }
Check 'allot student to room' (-not $allot.__error -and $allot.status -eq 'ACTIVE') ($allot | ConvertTo-Json -Compress)

$dupAllot = Req Post '/allocations' $token @{ studentId = $sneha.id; roomId = $room102.id; allotmentDate = '2026-10-11' }
Check 'second active allotment for same student rejected (409)' ($dupAllot.__error -and $dupAllot.__status -eq 409) ($dupAllot | ConvertTo-Json -Compress)

# room 201 is full (2/2)
$kabir = (Req Get '/students?q=Kabir' $token)[0]
$room201b = $rooms | Where-Object { $_.roomNumber -eq '201' }
$fullAllot = Req Post '/allocations' $token @{ studentId = $kabir.id; roomId = $room201b.id; allotmentDate = '2026-10-11' }
Check 'allotment to full room rejected (409)' ($fullAllot.__error -and $fullAllot.__status -eq 409) ($fullAllot | ConvertTo-Json -Compress)

# room 302 is maintenance
$maintenanceAllot = Req Post '/allocations' $token @{ studentId = $kabir.id; roomId = ($rooms | Where-Object { $_.roomNumber -eq '302' }).id; allotmentDate = '2026-10-11' }
Check 'allotment to maintenance room rejected (409)' ($maintenanceAllot.__error -and $maintenanceAllot.__status -eq 409) ($maintenanceAllot | ConvertTo-Json -Compress)

# checkout frees the bed
$checkout = Req Post "/allocations/$($allot.id)/checkout" $token $null
Check 'checkout succeeds' (-not $checkout.__error -and $checkout.status -eq 'CHECKED_OUT' -and $checkout.checkoutDate) ($checkout | ConvertTo-Json -Compress)

$stats2 = Req Get '/dashboard/stats' $token
Check 'available beds back to 4 after checkout' ($stats2.availableBeds -eq 4) ($stats2 | ConvertTo-Json -Compress)

$doubleCheckout = Req Post "/allocations/$($allot.id)/checkout" $token $null
Check 'double checkout rejected (400)' ($doubleCheckout.__error -and $doubleCheckout.__status -eq 400) ($doubleCheckout | ConvertTo-Json -Compress)

# ---- 6. Fees & Payments ----
$fees = Req Get '/fees' $token
Check 'fees list = 15' ($fees.Count -eq 15) ''
$paidFees = Req Get '/fees?status=PAID' $token
Check 'PAID filter = 7' ($paidFees.Count -eq 7) ''
$partialFees = Req Get '/fees?status=PARTIALLY_PAID' $token
Check 'PARTIALLY_PAID filter = 5' ($partialFees.Count -eq 5) ''
$pendingFees = Req Get '/fees?status=PENDING' $token
Check 'PENDING filter' ($pendingFees.Count -eq 3) ($pendingFees | ConvertTo-Json -Compress)

$feeSearch = Req Get '/fees?q=Ananya' $token
Check 'fee search by student' ($feeSearch.Count -eq 1) ''

# create fee for a student without one (STU-2026-016 Tanvi)
$tanvi = (Req Get '/students?q=Tanvi' $token)[0]
$feeCreated = Req Post '/fees' $token @{ studentId = $tanvi.id; amount = 12000; dueDate = '2026-11-30'; period = 'Aug - Dec 2026' }
Check 'create fee record' (-not $feeCreated.__error -and $feeCreated.status -eq 'PENDING' -and $feeCreated.balance -eq 12000) ($feeCreated | ConvertTo-Json -Compress)

# partial payment
$pay1 = Req Post "/fees/$($feeCreated.id)/payments" $token @{ amount = 5000; paymentDate = '2026-10-11'; method = 'UPI'; reference = 'UPI-TEST-001'; note = 'Test partial payment' }
Check 'partial payment recorded' (-not $pay1.__error) ($pay1 | ConvertTo-Json -Compress)

$feeAfter = Req Get "/fees/$($feeCreated.id)" $token
Check 'balance updated to 7000 / PARTIALLY_PAID' ($feeAfter.balance -eq 7000 -and $feeAfter.status -eq 'PARTIALLY_PAID' -and $feeAfter.payments.Count -eq 1) ($feeAfter | ConvertTo-Json -Compress -Depth 5)

# overpayment rejected
$overPay = Req Post "/fees/$($feeCreated.id)/payments" $token @{ amount = 8000; paymentDate = '2026-10-11'; method = 'CASH' }
Check 'overpayment rejected (409)' ($overPay.__error -and $overPay.__status -eq 409) ($overPay | ConvertTo-Json -Compress)

# zero payment rejected
$zeroPay = Req Post "/fees/$($feeCreated.id)/payments" $token @{ amount = 0; paymentDate = '2026-10-11'; method = 'CASH' }
Check 'zero payment rejected (400)' ($zeroPay.__error -and $zeroPay.__status -eq 400) ($zeroPay | ConvertTo-Json -Compress)

# duplicate reference rejected
$dupRef = Req Post "/fees/$($feeCreated.id)/payments" $token @{ amount = 1000; paymentDate = '2026-10-11'; method = 'UPI'; reference = 'UPI-TEST-001' }
Check 'duplicate payment reference rejected (409)' ($dupRef.__error -and $dupRef.__status -eq 409) ($dupRef | ConvertTo-Json -Compress)

# full payment completes the fee
$pay2 = Req Post "/fees/$($feeCreated.id)/payments" $token @{ amount = 7000; paymentDate = '2026-10-11'; method = 'CASH'; note = 'Balance' }
Check 'final payment recorded' (-not $pay2.__error) ''
$feeDone = Req Get "/fees/$($feeCreated.id)" $token
Check 'fee now PAID with zero balance' ($feeDone.status -eq 'PAID' -and $feeDone.balance -eq 0) ($feeDone | ConvertTo-Json -Compress)

# ---- 7. Complaints ----
$complaints = Req Get '/complaints' $token
Check 'complaints list = 5' ($complaints.Count -eq 5) ''
$openC = Req Get '/complaints?status=OPEN' $token
Check 'complaint status filter' ($openC.Count -eq 2) ''

$newComplaint = @{ studentId = $sneha.id; roomId = $room102.id; category = 'Plumbing'; description = 'Test complaint: tap leaking in room 102.'; priority = 'HIGH' }
$cmpCreated = Req Post '/complaints' $token $newComplaint
Check 'create complaint with generated ID' (-not $cmpCreated.__error -and $cmpCreated.complaintId -eq 'CMP-2026-006') ($cmpCreated | ConvertTo-Json -Compress)

$cmpStatus = Req Patch "/complaints/$($cmpCreated.id)/status" $token @{ status = 'IN_PROGRESS' }
Check 'complaint status change persists' (-not $cmpStatus.__error -and $cmpStatus.status -eq 'IN_PROGRESS') ($cmpStatus | ConvertTo-Json -Compress)

$cmpUpdated = Req Put "/complaints/$($cmpCreated.id)" $token (@{ studentId = $sneha.id; roomId = $null; category = 'Electricity'; description = 'Updated test complaint description.'; priority = 'MEDIUM' })
Check 'edit complaint details' (-not $cmpUpdated.__error -and $cmpUpdated.category -eq 'Electricity') ($cmpUpdated | ConvertTo-Json -Compress)

$cmpDel = Req Delete "/complaints/$($cmpCreated.id)" $token
Check 'delete complaint' (-not $cmpDel.__error) ''

# ---- summary ----
""
"=================================="
"RESULTS: $pass passed, $fail failed"
"=================================="
if ($fail -gt 0) { exit 1 }
