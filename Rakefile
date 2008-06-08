require 'rubygems'
require 'pp'


ADDON_VERSION = '0.1.0'
$xpifile = 'web/searchery-'+ADDON_VERSION+'.xpi'
$xpiurl = 'http://static.ianloic.com/searchery/searchery-'+ADDON_VERSION+'.xpi'

task :default => [$xpiurl]

XPIFILES = FileList['components/*.js', 'chrome/*', 'chrome.manifest', 
    'install.rdf']

file $xpifile => XPIFILES

task :clean do
  rm $xpifile, :force => true
end

# s3 upload task
task $xpiurl => $xpifile do |t|
  require 'uri'
  require 'net/http'
  require 'time'

  pp t
  pp t.methods

  uri = URI::parse(t.name)
  head = Net::HTTP.start(uri.host, uri.port) { |http|
    http.head(uri.request_uri)
  }

  timestamp = Rake::EARLY

  if head.code == '200' then
    puts 'hi'
    pp head
    timestamp = Time::httpdate(head['Last-Modified']) 
  end

  puts 'uploading: '+t.name
  puts head.code
  pp timestamp


  # get my S3 on
  require 'yaml'
  config = YAML.load_file(File.join(File.dirname(__FILE__), 's3.yaml'))
  require 'aws/s3'
  include AWS::S3
  Base.establish_connection!(
    :access_key_id => config['access_key_id'],
    :secret_access_key => config['secret_access_key']
  )

  # upload
  # FIXME: replace xpifile with t.XXX
  o = S3Object.store(uri.path, open($xpifile), uri.host, 
                    :content_type => 'application/x-xpinstall',
                    :access => :public_read)
  pp S3Object.exists?(uri.path, uri.host)
end

# a rule to zip XPIs
rule '.xpi' do |t|
  require 'zip/zip'
  rm t.name, :force=>true
  Zip::ZipFile.open(t.name, Zip::ZipFile::CREATE) do |zip|
    t.prerequisites.each do |f| 
      zip.add f, f
      puts "added #{f} to #{t.name}"
    end
  end
end
