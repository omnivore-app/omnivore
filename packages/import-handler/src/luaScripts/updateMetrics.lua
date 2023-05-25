local key = tostring(KEYS[1]);
local status = tostring(ARGV[1]);
local timestamp = tonumber(ARGV[2]);

-- increment the status counter
redis.call('HINCRBY', key, status, 1);

if (status == "imported" or status == "failed") then
  -- get the current metrics
  local bulk = redis.call('HGETALL', key);
  -- get the total, imported and failed counters
  local result = {}
	local nextkey
	for i, v in ipairs(bulk) do
		if i % 2 == 1 then
			nextkey = v
		else
			result[nextkey] = v
		end
	end
	
  local imported = tonumber(result['imported']) or 0;
  local failed = tonumber(result['failed']) or 0;
  local total = tonumber(result['total']) or 0;
  local state = tonumber(result['state']) or 0;
  if (state == 0 and imported + failed >= total) then
    -- all the records have been processed
    -- update the metrics
    redis.call('HSET', key, 'end_time', timestamp, 'state', 1);
  end
end
