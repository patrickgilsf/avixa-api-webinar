m = {}
print('lets  change this line of code')

function m.tf01(s, opt)
  if s then return 1 else return 0 end
end

--initializations
rj = require("rapidjson")

--variables
ip = Controls.IP.String
un = Controls.Username.String
pw = Controls.Password.String
fb = Controls.DeviceFB.String
nvxBaseUrl = 'https://'..ip..'/'
authHeader = {}

--delay function, for rest
function Delay(func, time)
  Timer.CallAfter(function() func() end, time) 
end

--Auth button visual feedback
function AuthFB(state)
  if state then
    -- print('Auth State: '..tostring(state))
    if state == "Authorizing" then 
      Controls.Authorized.Boolean = false
      Controls.Authorized.Legend = state.."..."
      Controls.Authorized.Color = "Grey"
    elseif state == true then
      Controls.Authorized.Boolean = true
      Controls.Authorized.Legend = "Authorized"
      Controls.Authorized.Color = "Green"
    end
  elseif not state or state == false then
    Controls.Authorized.Boolean = false
    Controls.Authorized.Legend = "Unuthorized"
    Controls.Authorized.Color = "Red"
  end
end
--check data for HTML, or requested Data
function AuthCheck(data)
  if data:find("<!DOCTYPE html>") then 
    print("Can't acquire streams because not authenticated")
    AuthFB()
    return false
  end
end 
--Authentication
function AuthHandler()
  authHeader["Content-Type"] = "application/json"
  --authenticate
  function auth()
    AuthFB("Authorizing")
    HttpClient.Upload({
    Url = 'https://'..ip..'/userlogin.html',
    Method = 'POST',
    Headers = {["Content-Type"] = "application/json"},
    Data = 'login='..un..'&&passwd='..pw,
    EventHandler = Response
    })
  end

  --auth response
  function Response(tbl, code, data, err, headers)
    cookieString = ''
    if code ~= 200 then print("Error with Code"..code) else
    print("Authentication Success, code",code)
      for hName,Val in pairs(headers) do
        if hName == "Set-Cookie" then 
          print("Found Authentication Cookies!")
          for k,v in pairs(Val) do
            cookieString = cookieString..v 
          end
          AuthFB(true) 
        end
      end
      authHeader["Cookie"] = cookieString
      --change auth feedback
      if cookieString == "" then AuthFB() end
    end
  end
  function keepAlive()
    auth()
    Timer.CallAfter(keepAlive, 300)
  end
  keepAlive()
end  

--preview
function GetPreview()
  HttpClient.Download {
    Url = nvxBaseUrl.."Device/Preview/",
    Headers = authHeader,
    Timeout = 10,
    EventHandler = function(t,c,d,e,h)
      if c ~= 200 then print("Error with code: "..c) else
        AuthCheck(d)
        local printUrl = rj.decode(d).Device.Preview.ImageList.Image3.IPv4Path
        HttpClient.Download { 
          Url = printUrl, 
          Headers = authHeader, 
          Data = "", 
          Timeout = 30, 
          EventHandler = function(t,c,d,e,h)
            Controls.Preview.Style = rj.encode({
            DrawChrome = false,
            IconData = Crypto.Base64Encode(d),
            Legend = ''
            })
          end 
        }
      end
    end
  }
end

--change input HDMI
function setHDMI(idx)
  HttpClient.Upload {
    Url = nvxBaseUrl.."Device/DeviceSpecific/VideoSource",
    Method = "POST",
    Data = '{"Device": {"DeviceSpecific": {"VideoSource": "Input'..idx..'"}}}',
    Headers = authHeader,
    EventHandler = function(t,c,d,e,h)
      if c ~= 200 then print('Error with code: '..c) else
        AuthCheck(d)
      end
    end
  }
  Timer.CallAfter(function() getHdmi() end, 2)
end
currentHdmi = nil
function getHdmi()
  return HttpClient.Download {
    Url = nvxBaseUrl.."Device/DeviceSpecific/VideoSource",
    Headers = authHeader,
    EventHandler = function (t,c,d,e,h)
      if c ~= 200 then print('Error with code: '..c) else
        AuthCheck(d)
        Timer.CallAfter(GetPreview, 2)
        local src = rj.decode(d).Device.DeviceSpecific.VideoSource:match("Input(%d)")
        print('src: '..src)
        currentHdmi = tonumber(src)
        for idx2, ctl2 in pairs(Controls.RouteInputs) do
          ctl2.Value = m.tf01(idx2 == currentHdmi)
        end
        Controls.SetRouteFromWeb.String = tostring(currentHdmi)
        return currentHdmi
      end
    end
  }
end

for idx, ctl in pairs(Controls.RouteInputs) do
  ctl.Legend = "Input "..idx
  ctl.CssClass = "button_video_inputs"
  ctl.EventHandler = function(c)
    print(idx.." hit")
    setHDMI(tostring(idx))
    getHdmi()
    Timer.CallAfter(
      function()
        for idx2, ctl2 in pairs(Controls.RouteInputs) do
          ctl2.Value = m.tf01(idx2 == currentHdmi)
        end
      end, 
      2
    )
  end
end
Controls.SetRouteFromWeb.EventHandler = function(c)
  getHdmi()
  setHDMI(c.String)
end
-- function Video
function Initialize()
  Controls.SetRouteFromWeb.String = ""
  AuthHandler()
  Delay(GetPreview, 1)
  Delay(getHdmi, 1)
  local function poll()
    getHdmi()
    Timer.CallAfter(
      function()
        print('current: '..currentHdmi)
        for idx2, ctl2 in pairs(Controls.RouteInputs) do
          ctl2.Value = m.tf01(idx2 == currentHdmi)
        end
      end, 
      2
    )
    Timer.CallAfter(poll, 5)
  end
  poll()
end
--event handlers re-initialize code
Controls.Authorized.EventHandler = Initialize
Controls.IP.EventHandler = Initialize
Controls.Username.EventHandler = Initialize
Controls.Password.EventHandler = Initialize

--initialize on runtime
Initialize()