import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type S = { name: string; shortName: string; district: string; emailDomain?: string | null };
const s = (name: string, shortName: string, district: string, emailDomain: string | null = null): S =>
  ({ name, shortName, district, emailDomain });

const schools: S[] = [
  // ─────────────────────────────────────────
  // ECSD - Edmonton Catholic School District
  // ─────────────────────────────────────────
  s('Archbishop MacDonald High School',  'Archbishop Mac',    'ECSD', 'ecsd.net'),
  s('Bishop Carroll High School',        'Bishop Carroll',    'ECSD', 'ecsd.net'),
  s('Holy Trinity Catholic High School', 'Holy Trinity',      'ECSD', 'ecsd.net'),
  s('J.H. Picard Catholic High School',  'J.H. Picard',       'ECSD', 'ecsd.net'),
  s('McNally High School',               'McNally',           'ECSD', 'ecsd.net'),
  s('Mother Margaret Mary High School',  'Mother Margaret',   'ECSD', 'ecsd.net'),
  s('Queen of Peace High School',        'Queen of Peace',    'ECSD', 'ecsd.net'),
  s('Sacred Heart High School',          'Sacred Heart',      'ECSD', 'ecsd.net'),
  s('St. Francis Xavier High School',    'St. FX',            'ECSD', 'ecsd.net'),
  s('St. Joseph High School',            'St. Joseph',        'ECSD', 'ecsd.net'),
  s('St. Maria Goretti High School',     'St. Maria Goretti', 'ECSD', 'ecsd.net'),
  s('St. Martin de Porres High School',  'St. Martin',        'ECSD', 'ecsd.net'),
  s('St. Nicholas High School',          'St. Nicholas',      'ECSD', 'ecsd.net'),
  s('St. Peter the Apostle High School', 'St. Peter',         'ECSD', 'ecsd.net'),

  // ─────────────────────────────────────────
  // EPSB - Edmonton Public Schools
  // ─────────────────────────────────────────
  s('Eastglen High School',           'Eastglen',        'EPSB', 'share.epsb.ca'),
  s('Harry Ainlay High School',       'Harry Ainlay',    'EPSB', 'share.epsb.ca'),
  s('J. Percy Page High School',      'J. Percy Page',   'EPSB', 'share.epsb.ca'),
  s('Jasper Place High School',       'Jasper Place',    'EPSB', 'share.epsb.ca'),
  s('Lillian Osborne High School',    'Lillian Osborne', 'EPSB', 'share.epsb.ca'),
  s('M.E. LaZerte High School',       'M.E. LaZerte',    'EPSB', 'share.epsb.ca'),
  s('Old Scona Academic High School', 'Old Scona',       'EPSB', 'share.epsb.ca'),
  s('Ross Sheppard High School',      'Ross Sheppard',   'EPSB', 'share.epsb.ca'),
  s('Strathcona High School',         'Strathcona',      'EPSB', 'share.epsb.ca'),
  s('Victoria School of the Arts',    'Victoria',        'EPSB', 'share.epsb.ca'),
  s('W.P. Wagner High School',        'W.P. Wagner',     'EPSB', 'share.epsb.ca'),
  s('Windermere High School',         'Windermere',      'EPSB', 'share.epsb.ca'),
  s('Paul Kane High School',          'Paul Kane',       'EPSB', 'share.epsb.ca'),
  s('Calder High School',             'Calder',          'EPSB', 'share.epsb.ca'),

  // ─────────────────────────────────────────
  // CANADA - Alberta
  // ─────────────────────────────────────────
  s('University of Alberta',                  'UAlberta',    'Alberta'),
  s('University of Calgary',                  'UCalgary',    'Alberta'),
  s('University of Lethbridge',               'ULethbridge', 'Alberta'),
  s('Athabasca University',                   'AU',          'Alberta'),
  s('MacEwan University',                     'MacEwan',     'Alberta'),
  s('Mount Royal University',                 'MRU',         'Alberta'),
  s('NAIT (Northern Alberta Institute of Technology)', 'NAIT', 'Alberta'),
  s('SAIT (Southern Alberta Institute of Technology)', 'SAIT', 'Alberta'),
  s('Concordia University of Edmonton',       'CUE',         'Alberta'),
  s('Ambrose University',                     'Ambrose',     'Alberta'),
  s('Red Deer Polytechnic',                   'RDP',         'Alberta'),
  s('Lethbridge College',                     'Lethbridge College', 'Alberta'),
  s('Portage College',                        'Portage',     'Alberta'),
  s('Lakeland College',                       'Lakeland',    'Alberta'),
  s('Grande Prairie Regional College',        'GPRC',        'Alberta'),
  s('Medicine Hat College',                   'MHC',         'Alberta'),
  s('Bow Valley College',                     'BVC',         'Alberta'),
  s('NorQuest College',                       'NorQuest',    'Alberta'),
  s('Northwestern Polytechnic',               'NWP',         'Alberta'),

  // ─────────────────────────────────────────
  // CANADA - British Columbia
  // ─────────────────────────────────────────
  s('University of British Columbia',         'UBC',         'British Columbia'),
  s('Simon Fraser University',                'SFU',         'British Columbia'),
  s('University of Victoria',                 'UVic',        'British Columbia'),
  s('University of Northern British Columbia','UNBC',         'British Columbia'),
  s('Thompson Rivers University',             'TRU',         'British Columbia'),
  s('Kwantlen Polytechnic University',        'KPU',         'British Columbia'),
  s('Langara College',                        'Langara',     'British Columbia'),
  s('Vancouver Island University',            'VIU',         'British Columbia'),
  s('Emily Carr University of Art + Design',  'ECUAD',       'British Columbia'),
  s('Royal Roads University',                 'Royal Roads', 'British Columbia'),
  s('Trinity Western University',             'TWU',         'British Columbia'),
  s('British Columbia Institute of Technology','BCIT',        'British Columbia'),
  s('Capilano University',                    'CapU',        'British Columbia'),
  s('Douglas College',                        'Douglas',     'British Columbia'),
  s('Okanagan College',                       'Okanagan',    'British Columbia'),
  s('College of the Rockies',                 'COTR',        'British Columbia'),
  s('Northwest Community College',            'NWCC',        'British Columbia'),
  s('Selkirk College',                        'Selkirk',     'British Columbia'),
  s('Camosun College',                        'Camosun',     'British Columbia'),
  s('Columbia Bible College',                 'CBC',         'British Columbia'),

  // ─────────────────────────────────────────
  // CANADA - Manitoba
  // ─────────────────────────────────────────
  s('University of Manitoba',                 'UManitoba',   'Manitoba'),
  s('University of Winnipeg',                 'UWinnipeg',   'Manitoba'),
  s('Brandon University',                     'BU',          'Manitoba'),
  s('Red River College Polytechnic',          'RRC',         'Manitoba'),
  s('Canadian Mennonite University',          'CMU',         'Manitoba'),
  s('Assiniboine Community College',          'ACC',         'Manitoba'),

  // ─────────────────────────────────────────
  // CANADA - New Brunswick
  // ─────────────────────────────────────────
  s('University of New Brunswick',            'UNB',         'New Brunswick'),
  s('Université de Moncton',                  'UMoncton',    'New Brunswick'),
  s('Mount Allison University',               'MtA',         'New Brunswick'),
  s('St. Thomas University',                  'STU',         'New Brunswick'),
  s('New Brunswick Community College',        'NBCC',        'New Brunswick'),

  // ─────────────────────────────────────────
  // CANADA - Newfoundland & Labrador
  // ─────────────────────────────────────────
  s('Memorial University of Newfoundland',    'MUN',         'Newfoundland & Labrador'),
  s('College of the North Atlantic',          'CNA',         'Newfoundland & Labrador'),

  // ─────────────────────────────────────────
  // CANADA - Nova Scotia
  // ─────────────────────────────────────────
  s('Dalhousie University',                   'Dal',         'Nova Scotia'),
  s('Acadia University',                      'Acadia',      'Nova Scotia'),
  s('St. Francis Xavier University',          'StFX',        'Nova Scotia'),
  s('Cape Breton University',                 'CBU',         'Nova Scotia'),
  s('NSCAD University',                       'NSCAD',       'Nova Scotia'),
  s('Mount Saint Vincent University',         'MSVU',        'Nova Scotia'),
  s('Nova Scotia Community College',          'NSCC',        'Nova Scotia'),
  s('King\'s University College (NS)',        'King\'s NS',  'Nova Scotia'),

  // ─────────────────────────────────────────
  // CANADA - Ontario
  // ─────────────────────────────────────────
  s('University of Toronto',                  'UofT',        'Ontario'),
  s('McMaster University',                    'McMaster',    'Ontario'),
  s('Western University',                     'Western',     'Ontario'),
  s('Queen\'s University',                    'Queen\'s',    'Ontario'),
  s('University of Waterloo',                 'UWaterloo',   'Ontario'),
  s('Carleton University',                    'Carleton',    'Ontario'),
  s('York University',                        'York',        'Ontario'),
  s('University of Ottawa',                   'uOttawa',     'Ontario'),
  s('Toronto Metropolitan University',        'TMU',         'Ontario'),
  s('Ontario Tech University',                'OntarioTech', 'Ontario'),
  s('Wilfrid Laurier University',             'Laurier',     'Ontario'),
  s('Brock University',                       'Brock',       'Ontario'),
  s('Trent University',                       'Trent',       'Ontario'),
  s('Lakehead University',                    'Lakehead',    'Ontario'),
  s('Laurentian University',                  'Laurentian',  'Ontario'),
  s('University of Windsor',                  'UWindsor',    'Ontario'),
  s('University of Guelph',                   'UGuelph',     'Ontario'),
  s('OCAD University',                        'OCADU',       'Ontario'),
  s('Algoma University',                      'Algoma',      'Ontario'),
  s('Nipissing University',                   'Nipissing',   'Ontario'),
  s('Royal Military College of Canada',       'RMC',         'Ontario'),
  s('Redeemer University',                    'Redeemer',    'Ontario'),
  s('St. Jerome\'s University',               'SJU',         'Ontario'),
  s('Seneca Polytechnic',                     'Seneca',      'Ontario'),
  s('Humber College',                         'Humber',      'Ontario'),
  s('George Brown College',                   'GBC',         'Ontario'),
  s('Centennial College',                     'Centennial',  'Ontario'),
  s('Sheridan College',                       'Sheridan',    'Ontario'),
  s('Conestoga College',                      'Conestoga',   'Ontario'),
  s('Durham College',                         'Durham',      'Ontario'),
  s('Fanshawe College',                       'Fanshawe',    'Ontario'),
  s('Mohawk College',                         'Mohawk',      'Ontario'),
  s('St. Lawrence College',                   'SLC',         'Ontario'),
  s('Algonquin College',                      'Algonquin',   'Ontario'),
  s('Loyalist College',                       'Loyalist',    'Ontario'),
  s('Fleming College',                        'Fleming',     'Ontario'),
  s('Georgian College',                       'Georgian',    'Ontario'),
  s('Cambrian College',                       'Cambrian',    'Ontario'),
  s('Northern College',                       'Northern',    'Ontario'),
  s('Sault College',                          'Sault',       'Ontario'),
  s('St. Clair College',                      'St. Clair',   'Ontario'),
  s('Lambton College',                        'Lambton',     'Ontario'),
  s('Confederation College',                  'Confederation','Ontario'),

  // ─────────────────────────────────────────
  // CANADA - Prince Edward Island
  // ─────────────────────────────────────────
  s('University of Prince Edward Island',     'UPEI',        'Prince Edward Island'),
  s('Holland College',                        'Holland',     'Prince Edward Island'),

  // ─────────────────────────────────────────
  // CANADA - Quebec
  // ─────────────────────────────────────────
  s('McGill University',                      'McGill',      'Quebec'),
  s('Université de Montréal',                 'UdeM',        'Quebec'),
  s('Concordia University',                   'Concordia',   'Quebec'),
  s('Université Laval',                       'ULaval',      'Quebec'),
  s('Université du Québec à Montréal',        'UQAM',        'Quebec'),
  s('HEC Montréal',                           'HEC',         'Quebec'),
  s('Polytechnique Montréal',                 'PolyMtl',     'Quebec'),
  s('Bishop\'s University',                   'Bishop\'s',   'Quebec'),
  s('Université de Sherbrooke',               'UdeSherbrooke','Quebec'),
  s('Université du Québec à Trois-Rivières',  'UQTR',        'Quebec'),
  s('Université du Québec à Chicoutimi',      'UQAC',        'Quebec'),
  s('Université du Québec en Outaouais',      'UQO',         'Quebec'),
  s('Université du Québec à Rimouski',        'UQAR',        'Quebec'),
  s('École de technologie supérieure',        'ETS',         'Quebec'),
  s('Institut national de la recherche scientifique', 'INRS', 'Quebec'),

  // ─────────────────────────────────────────
  // CANADA - Saskatchewan
  // ─────────────────────────────────────────
  s('University of Saskatchewan',             'USask',       'Saskatchewan'),
  s('University of Regina',                   'URegina',     'Saskatchewan'),
  s('First Nations University of Canada',     'FNUniv',      'Saskatchewan'),
  s('Saskatchewan Polytechnic',               'SaskPolytech','Saskatchewan'),

  // ─────────────────────────────────────────
  // CANADA - Northwest Territories / Yukon / Nunavut
  // ─────────────────────────────────────────
  s('Yukon University',                       'YukonU',      'Yukon'),
  s('Aurora College',                         'Aurora',      'Northwest Territories'),
  s('Nunavut Arctic College',                 'NAC',         'Nunavut'),

  // ─────────────────────────────────────────
  // USA - Alabama
  // ─────────────────────────────────────────
  s('University of Alabama',                  'UA',          'Alabama'),
  s('Auburn University',                      'Auburn',      'Alabama'),
  s('University of Alabama at Birmingham',    'UAB',         'Alabama'),
  s('University of Alabama in Huntsville',    'UAH',         'Alabama'),
  s('University of South Alabama',            'South Alabama','Alabama'),
  s('Alabama State University',               'ASU',         'Alabama'),
  s('Alabama A&M University',                 'AAMU',        'Alabama'),
  s('Troy University',                        'Troy',        'Alabama'),
  s('Jacksonville State University',          'JSU',         'Alabama'),
  s('Samford University',                     'Samford',     'Alabama'),
  s('Tuskegee University',                    'Tuskegee',    'Alabama'),
  s('Auburn University at Montgomery',        'AUM',         'Alabama'),
  s('Faulkner University',                    'Faulkner',    'Alabama'),
  s('Huntingdon College',                     'Huntingdon',  'Alabama'),
  s('University of Montevallo',               'Montevallo',  'Alabama'),

  // ─────────────────────────────────────────
  // USA - Alaska
  // ─────────────────────────────────────────
  s('University of Alaska Fairbanks',         'UAF',         'Alaska'),
  s('University of Alaska Anchorage',         'UAA',         'Alaska'),
  s('University of Alaska Southeast',         'UAS',         'Alaska'),
  s('Alaska Pacific University',              'APU',         'Alaska'),

  // ─────────────────────────────────────────
  // USA - Arizona
  // ─────────────────────────────────────────
  s('University of Arizona',                  'UA',          'Arizona'),
  s('Arizona State University',               'ASU',         'Arizona'),
  s('Northern Arizona University',            'NAU',         'Arizona'),
  s('Grand Canyon University',                'GCU',         'Arizona'),
  s('Arizona Christian University',           'ACU',         'Arizona'),
  s('Embry-Riddle Aeronautical University (AZ)', 'Embry-Riddle', 'Arizona'),
  s('Prescott College',                       'Prescott',    'Arizona'),

  // ─────────────────────────────────────────
  // USA - Arkansas
  // ─────────────────────────────────────────
  s('University of Arkansas',                 'UArk',        'Arkansas'),
  s('Arkansas State University',              'A-State',     'Arkansas'),
  s('University of Central Arkansas',         'UCA',         'Arkansas'),
  s('Hendrix College',                        'Hendrix',     'Arkansas'),
  s('Arkansas Tech University',               'ATU',         'Arkansas'),
  s('Ouachita Baptist University',            'OBU',         'Arkansas'),
  s('Harding University',                     'Harding',     'Arkansas'),

  // ─────────────────────────────────────────
  // USA - California
  // ─────────────────────────────────────────
  s('University of California, Berkeley',     'UC Berkeley', 'California'),
  s('University of California, Los Angeles',  'UCLA',        'California'),
  s('University of California, San Diego',    'UC San Diego','California'),
  s('University of California, Davis',        'UC Davis',    'California'),
  s('University of California, Santa Barbara','UC Santa Barbara','California'),
  s('University of California, Irvine',       'UC Irvine',   'California'),
  s('University of California, Riverside',    'UC Riverside','California'),
  s('University of California, Santa Cruz',   'UC Santa Cruz','California'),
  s('University of California, Merced',       'UC Merced',   'California'),
  s('Stanford University',                    'Stanford',    'California'),
  s('University of Southern California',      'USC',         'California'),
  s('California Institute of Technology',     'Caltech',     'California'),
  s('California State University, Long Beach','CSULB',       'California'),
  s('California State University, Fullerton', 'CSUF',        'California'),
  s('California State University, Los Angeles','CSULA',      'California'),
  s('California State University, Northridge','CSUN',        'California'),
  s('California State University, Sacramento','Sac State',   'California'),
  s('California State University, Fresno',    'Fresno State','California'),
  s('California State University, San Bernardino','CSUSB',   'California'),
  s('California State University, Bakersfield','CSUB',       'California'),
  s('California State University, Dominguez Hills','CSUDH',  'California'),
  s('California State University, East Bay',  'CSUEB',       'California'),
  s('California State University, Monterey Bay','CSUMB',     'California'),
  s('California State University, San Marcos','CSUSM',       'California'),
  s('California State University, Stanislaus','CS Stanislaus','California'),
  s('California State University, Channel Islands','CSUCI',  'California'),
  s('California State Polytechnic University, SLO','Cal Poly SLO','California'),
  s('California State Polytechnic University, Pomona','Cal Poly Pomona','California'),
  s('San Diego State University',             'SDSU',        'California'),
  s('San Jose State University',              'SJSU',        'California'),
  s('San Francisco State University',         'SFSU',        'California'),
  s('Humboldt State University',              'Cal Poly Humboldt','California'),
  s('Sonoma State University',                'SSU',         'California'),
  s('Fresno Pacific University',              'FPU',         'California'),
  s('Pepperdine University',                  'Pepperdine',  'California'),
  s('Loyola Marymount University',            'LMU',         'California'),
  s('University of San Diego',               'USD',         'California'),
  s('University of San Francisco',           'USF',         'California'),
  s('Santa Clara University',                'SCU',         'California'),
  s('Claremont McKenna College',             'CMC',         'California'),
  s('Harvey Mudd College',                   'Harvey Mudd', 'California'),
  s('Pomona College',                        'Pomona',      'California'),
  s('Scripps College',                       'Scripps',     'California'),
  s('Pitzer College',                        'Pitzer',      'California'),
  s('Occidental College',                    'Oxy',         'California'),
  s('Whittier College',                      'Whittier',    'California'),
  s('Biola University',                      'Biola',       'California'),
  s('Point Loma Nazarene University',        'PLNU',        'California'),
  s('Vanguard University',                   'Vanguard',    'California'),
  s('Dominican University of California',    'Dominican CA','California'),
  s('Mills College',                         'Mills',       'California'),
  s('Saint Mary\'s College of California',   'SMC',         'California'),
  s('University of the Pacific',             'UOP',         'California'),
  s('California Lutheran University',        'Cal Lutheran','California'),
  s('Chapman University',                    'Chapman',     'California'),
  s('Azusa Pacific University',              'APU',         'California'),

  // ─────────────────────────────────────────
  // USA - Colorado
  // ─────────────────────────────────────────
  s('University of Colorado Boulder',        'CU Boulder',  'Colorado'),
  s('Colorado State University',             'CSU',         'Colorado'),
  s('University of Denver',                  'DU',          'Colorado'),
  s('Colorado School of Mines',              'Mines',       'Colorado'),
  s('University of Colorado Colorado Springs','UCCS',       'Colorado'),
  s('University of Colorado Denver',         'CU Denver',   'Colorado'),
  s('Colorado College',                      'CC',          'Colorado'),
  s('Metropolitan State University of Denver','MSU Denver', 'Colorado'),
  s('Fort Lewis College',                    'FLC',         'Colorado'),
  s('Western Colorado University',           'Western Colorado','Colorado'),
  s('Adams State University',                'Adams State', 'Colorado'),
  s('Regis University',                      'Regis',       'Colorado'),

  // ─────────────────────────────────────────
  // USA - Connecticut
  // ─────────────────────────────────────────
  s('Yale University',                       'Yale',        'Connecticut'),
  s('University of Connecticut',             'UConn',       'Connecticut'),
  s('Wesleyan University',                   'Wesleyan',    'Connecticut'),
  s('Trinity College (Hartford)',            'Trinity CT',  'Connecticut'),
  s('Fairfield University',                  'Fairfield',   'Connecticut'),
  s('Sacred Heart University',               'SHU',         'Connecticut'),
  s('Quinnipiac University',                 'Quinnipiac',  'Connecticut'),
  s('University of Hartford',               'UHart',       'Connecticut'),
  s('Connecticut College',                  'Conn College','Connecticut'),
  s('Southern Connecticut State University','SCSU',         'Connecticut'),
  s('Central Connecticut State University', 'CCSU',        'Connecticut'),
  s('Western Connecticut State University', 'WCSU',        'Connecticut'),
  s('Eastern Connecticut State University', 'ECSU',        'Connecticut'),
  s('Post University',                       'Post',        'Connecticut'),

  // ─────────────────────────────────────────
  // USA - Delaware
  // ─────────────────────────────────────────
  s('University of Delaware',               'UD',          'Delaware'),
  s('Delaware State University',            'DSU',         'Delaware'),
  s('Wilmington University',                'WilmU',       'Delaware'),
  s('Wesley College',                       'Wesley',      'Delaware'),

  // ─────────────────────────────────────────
  // USA - Florida
  // ─────────────────────────────────────────
  s('University of Florida',                'UF',          'Florida'),
  s('Florida State University',             'FSU',         'Florida'),
  s('University of Central Florida',        'UCF',         'Florida'),
  s('University of South Florida',          'USF',         'Florida'),
  s('Florida International University',     'FIU',         'Florida'),
  s('Florida Atlantic University',          'FAU',         'Florida'),
  s('Florida Gulf Coast University',        'FGCU',        'Florida'),
  s('University of Miami',                  'UM',          'Florida'),
  s('Rollins College',                      'Rollins',     'Florida'),
  s('Stetson University',                   'Stetson',     'Florida'),
  s('Florida Institute of Technology',      'Florida Tech','Florida'),
  s('Nova Southeastern University',         'NSU',         'Florida'),
  s('University of West Florida',           'UWF',         'Florida'),
  s('University of North Florida',          'UNF',         'Florida'),
  s('Florida A&M University',               'FAMU',        'Florida'),
  s('Florida International University',     'FIU',         'Florida'),
  s('Barry University',                     'Barry',       'Florida'),
  s('Saint Leo University',                 'Saint Leo',   'Florida'),
  s('Embry-Riddle Aeronautical University', 'Embry-Riddle','Florida'),
  s('Palm Beach Atlantic University',       'PBA',         'Florida'),
  s('Eckerd College',                       'Eckerd',      'Florida'),
  s('Flagler College',                      'Flagler',     'Florida'),
  s('Bethune-Cookman University',           'BCU',         'Florida'),

  // ─────────────────────────────────────────
  // USA - Georgia
  // ─────────────────────────────────────────
  s('Georgia Institute of Technology',      'Georgia Tech','Georgia'),
  s('University of Georgia',                'UGA',         'Georgia'),
  s('Georgia State University',             'GSU',         'Georgia'),
  s('Emory University',                     'Emory',       'Georgia'),
  s('Mercer University',                    'Mercer',      'Georgia'),
  s('Spelman College',                      'Spelman',     'Georgia'),
  s('Morehouse College',                    'Morehouse',   'Georgia'),
  s('Kennesaw State University',            'KSU',         'Georgia'),
  s('Georgia Southern University',          'Georgia Southern','Georgia'),
  s('Augusta University',                   'Augusta',     'Georgia'),
  s('Valdosta State University',            'VSU',         'Georgia'),
  s('Columbus State University',            'CSU GA',      'Georgia'),
  s('University of West Georgia',           'UWG',         'Georgia'),
  s('Clark Atlanta University',             'CAU',         'Georgia'),
  s('Agnes Scott College',                  'Agnes Scott', 'Georgia'),
  s('Berry College',                        'Berry',       'Georgia'),
  s('Georgia College & State University',   'GCSU',        'Georgia'),
  s('Savannah College of Art and Design',   'SCAD',        'Georgia'),
  s('Oglethorpe University',                'Oglethorpe',  'Georgia'),

  // ─────────────────────────────────────────
  // USA - Hawaii
  // ─────────────────────────────────────────
  s('University of Hawaii at Manoa',        'UH Manoa',    'Hawaii'),
  s('University of Hawaii at Hilo',         'UH Hilo',     'Hawaii'),
  s('Chaminade University of Honolulu',     'Chaminade',   'Hawaii'),
  s('Hawaii Pacific University',            'HPU',         'Hawaii'),

  // ─────────────────────────────────────────
  // USA - Idaho
  // ─────────────────────────────────────────
  s('University of Idaho',                  'UI',          'Idaho'),
  s('Boise State University',               'BSU',         'Idaho'),
  s('Idaho State University',               'ISU',         'Idaho'),
  s('Lewis-Clark State College',            'LCSC',        'Idaho'),
  s('College of Idaho',                     'College of Idaho','Idaho'),
  s('Northwest Nazarene University',        'NNU',         'Idaho'),

  // ─────────────────────────────────────────
  // USA - Illinois
  // ─────────────────────────────────────────
  s('University of Illinois Urbana-Champaign','UIUC',      'Illinois'),
  s('Northwestern University',              'Northwestern','Illinois'),
  s('University of Chicago',                'UChicago',    'Illinois'),
  s('Illinois State University',            'ISU',         'Illinois'),
  s('Southern Illinois University Carbondale','SIUC',      'Illinois'),
  s('Southern Illinois University Edwardsville','SIUE',    'Illinois'),
  s('Loyola University Chicago',            'Loyola Chicago','Illinois'),
  s('DePaul University',                    'DePaul',      'Illinois'),
  s('Illinois Institute of Technology',     'Illinois Tech','Illinois'),
  s('Wheaton College (Illinois)',            'Wheaton IL',  'Illinois'),
  s('Western Illinois University',          'WIU',         'Illinois'),
  s('Northern Illinois University',         'NIU',         'Illinois'),
  s('Eastern Illinois University',          'EIU',         'Illinois'),
  s('Governors State University',           'GSU IL',      'Illinois'),
  s('Chicago State University',             'CSU IL',      'Illinois'),
  s('Northeastern Illinois University',     'NEIU',        'Illinois'),
  s('University of Illinois Chicago',       'UIC',         'Illinois'),
  s('Lake Forest College',                  'Lake Forest', 'Illinois'),
  s('Knox College',                         'Knox',        'Illinois'),
  s('Millikin University',                  'Millikin',    'Illinois'),
  s('Augustana College (Illinois)',         'Augustana IL','Illinois'),
  s('Bradley University',                   'Bradley',     'Illinois'),
  s('Elmhurst University',                  'Elmhurst',    'Illinois'),
  s('Illinois Wesleyan University',         'IWU',         'Illinois'),
  s('Monmouth College (Illinois)',          'Monmouth IL', 'Illinois'),
  s('North Central College',               'NCC',         'Illinois'),
  s('North Park University',               'NPU',         'Illinois'),
  s('Quincy University',                   'QU',          'Illinois'),
  s('Rockford University',                 'RU IL',       'Illinois'),
  s('Roosevelt University',                'Roosevelt',   'Illinois'),
  s('Saint Xavier University',             'SXU',         'Illinois'),

  // ─────────────────────────────────────────
  // USA - Indiana
  // ─────────────────────────────────────────
  s('Purdue University',                   'Purdue',      'Indiana'),
  s('Indiana University Bloomington',      'IU',          'Indiana'),
  s('University of Notre Dame',            'Notre Dame',  'Indiana'),
  s('Ball State University',               'BSU IN',      'Indiana'),
  s('Indiana State University',            'ISU IN',      'Indiana'),
  s('Butler University',                   'Butler',      'Indiana'),
  s('Valparaiso University',               'Valpo',       'Indiana'),
  s('DePauw University',                   'DePauw',      'Indiana'),
  s('Wabash College',                      'Wabash',      'Indiana'),
  s('Purdue University Northwest',         'PNW',         'Indiana'),
  s('Indiana University–Purdue University Indianapolis','IUPUI','Indiana'),
  s('University of Southern Indiana',     'USI',         'Indiana'),
  s('Indiana Wesleyan University',         'IWU IN',      'Indiana'),
  s('Taylor University',                   'Taylor',      'Indiana'),
  s('Goshen College',                      'Goshen',      'Indiana'),
  s('Earlham College',                     'Earlham',     'Indiana'),
  s('Hanover College',                     'Hanover',     'Indiana'),
  s('Manchester University',               'Manchester',  'Indiana'),
  s('Rose-Hulman Institute of Technology','Rose-Hulman',  'Indiana'),
  s('Trine University',                    'Trine',       'Indiana'),
  s('University of Indianapolis',          'UIndy',       'Indiana'),

  // ─────────────────────────────────────────
  // USA - Iowa
  // ─────────────────────────────────────────
  s('University of Iowa',                  'UIowa',       'Iowa'),
  s('Iowa State University',               'ISU IA',      'Iowa'),
  s('University of Northern Iowa',         'UNI',         'Iowa'),
  s('Drake University',                    'Drake',       'Iowa'),
  s('Grinnell College',                    'Grinnell',    'Iowa'),
  s('Cornell College',                     'Cornell IA',  'Iowa'),
  s('Luther College',                      'Luther',      'Iowa'),
  s('Coe College',                         'Coe',         'Iowa'),
  s('Iowa Wesleyan University',            'IWU IA',      'Iowa'),
  s('Loras College',                       'Loras',       'Iowa'),
  s('Simpson College',                     'Simpson',     'Iowa'),
  s('Wartburg College',                    'Wartburg',    'Iowa'),

  // ─────────────────────────────────────────
  // USA - Kansas
  // ─────────────────────────────────────────
  s('University of Kansas',                'KU',          'Kansas'),
  s('Kansas State University',             'K-State',     'Kansas'),
  s('Wichita State University',            'WSU',         'Kansas'),
  s('Washburn University',                 'Washburn',    'Kansas'),
  s('Fort Hays State University',          'FHSU',        'Kansas'),
  s('Pittsburg State University',          'Pitt State',  'Kansas'),
  s('Emporia State University',            'ESU',         'Kansas'),
  s('Kansas Wesleyan University',          'KWU',         'Kansas'),
  s('Bethel College (Kansas)',             'Bethel KS',   'Kansas'),
  s('Friends University',                  'Friends',     'Kansas'),

  // ─────────────────────────────────────────
  // USA - Kentucky
  // ─────────────────────────────────────────
  s('University of Kentucky',              'UK',          'Kentucky'),
  s('University of Louisville',            'UofL',        'Kentucky'),
  s('Western Kentucky University',         'WKU',         'Kentucky'),
  s('Eastern Kentucky University',         'EKU',         'Kentucky'),
  s('Morehead State University',           'MSU KY',      'Kentucky'),
  s('Northern Kentucky University',        'NKU',         'Kentucky'),
  s('Murray State University',             'Murray State','Kentucky'),
  s('Bellarmine University',               'Bellarmine',  'Kentucky'),
  s('Kentucky State University',           'KSU KY',      'Kentucky'),
  s('Transylvania University',             'Transy',      'Kentucky'),
  s('Centre College',                      'Centre',      'Kentucky'),
  s('Berea College',                       'Berea',       'Kentucky'),

  // ─────────────────────────────────────────
  // USA - Louisiana
  // ─────────────────────────────────────────
  s('Louisiana State University',          'LSU',         'Louisiana'),
  s('Tulane University',                   'Tulane',      'Louisiana'),
  s('University of New Orleans',           'UNO',         'Louisiana'),
  s('Loyola University New Orleans',       'Loyola NOLA', 'Louisiana'),
  s('Southern University and A&M College', 'Southern LA', 'Louisiana'),
  s('Xavier University of Louisiana',      'Xavier LA',   'Louisiana'),
  s('Grambling State University',          'Grambling',   'Louisiana'),
  s('Louisiana Tech University',           'La Tech',     'Louisiana'),
  s('University of Louisiana at Lafayette','UL Lafayette','Louisiana'),
  s('University of Louisiana at Monroe',   'ULM',         'Louisiana'),
  s('Nicholls State University',           'Nicholls',    'Louisiana'),
  s('McNeese State University',            'McNeese',     'Louisiana'),
  s('Northwestern State University',       'NSU LA',      'Louisiana'),
  s('Southeastern Louisiana University',   'SLU',         'Louisiana'),

  // ─────────────────────────────────────────
  // USA - Maine
  // ─────────────────────────────────────────
  s('University of Maine',                 'UMaine',      'Maine'),
  s('Bowdoin College',                     'Bowdoin',     'Maine'),
  s('Bates College',                       'Bates',       'Maine'),
  s('Colby College',                       'Colby',       'Maine'),
  s('University of Southern Maine',        'USM',         'Maine'),
  s('University of New England',           'UNE',         'Maine'),
  s('University of Maine at Farmington',   'UMF',         'Maine'),
  s('Saint Joseph\'s College of Maine',    'SJC Maine',   'Maine'),

  // ─────────────────────────────────────────
  // USA - Maryland
  // ─────────────────────────────────────────
  s('University of Maryland, College Park','UMD',         'Maryland'),
  s('Johns Hopkins University',            'JHU',         'Maryland'),
  s('Towson University',                   'Towson',      'Maryland'),
  s('University of Maryland, Baltimore County','UMBC',    'Maryland'),
  s('University of Maryland, Eastern Shore','UMES',       'Maryland'),
  s('University of Maryland Global Campus','UMGC',        'Maryland'),
  s('Loyola University Maryland',          'Loyola MD',   'Maryland'),
  s('Goucher College',                     'Goucher',     'Maryland'),
  s('St. John\'s College (MD)',            'St. John\'s MD','Maryland'),
  s('United States Naval Academy',         'USNA',        'Maryland'),
  s('Morgan State University',             'Morgan State','Maryland'),
  s('Salisbury University',                'SU',          'Maryland'),
  s('Frostburg State University',          'FSU MD',      'Maryland'),
  s('Hood College',                        'Hood',        'Maryland'),
  s('Washington College',                  'Washington College MD','Maryland'),
  s('McDaniel College',                    'McDaniel',    'Maryland'),

  // ─────────────────────────────────────────
  // USA - Massachusetts
  // ─────────────────────────────────────────
  s('Massachusetts Institute of Technology','MIT',        'Massachusetts'),
  s('Harvard University',                  'Harvard',     'Massachusetts'),
  s('Boston University',                   'BU',          'Massachusetts'),
  s('Northeastern University',             'Northeastern','Massachusetts'),
  s('Boston College',                      'BC',          'Massachusetts'),
  s('Tufts University',                    'Tufts',       'Massachusetts'),
  s('University of Massachusetts Amherst', 'UMass Amherst','Massachusetts'),
  s('University of Massachusetts Boston',  'UMass Boston','Massachusetts'),
  s('University of Massachusetts Lowell',  'UMass Lowell','Massachusetts'),
  s('University of Massachusetts Dartmouth','UMass Dartmouth','Massachusetts'),
  s('University of Massachusetts Medical School','UMMS', 'Massachusetts'),
  s('Wellesley College',                   'Wellesley',   'Massachusetts'),
  s('Smith College',                       'Smith',       'Massachusetts'),
  s('Mount Holyoke College',               'MHC MA',      'Massachusetts'),
  s('Amherst College',                     'Amherst',     'Massachusetts'),
  s('Williams College',                    'Williams',    'Massachusetts'),
  s('Brandeis University',                 'Brandeis',    'Massachusetts'),
  s('Worcester Polytechnic Institute',     'WPI',         'Massachusetts'),
  s('Clark University',                    'Clark',       'Massachusetts'),
  s('College of the Holy Cross',           'Holy Cross',  'Massachusetts'),
  s('Hampshire College',                   'Hampshire',   'Massachusetts'),
  s('Mount Ida College',                   'Mount Ida',   'Massachusetts'),
  s('Stonehill College',                   'Stonehill',   'Massachusetts'),
  s('Assumption University',               'Assumption',  'Massachusetts'),
  s('Anna Maria College',                  'Anna Maria',  'Massachusetts'),
  s('Bay Path University',                 'Bay Path',    'Massachusetts'),
  s('Bridgewater State University',        'BSU MA',      'Massachusetts'),
  s('Fitchburg State University',          'Fitchburg',   'Massachusetts'),
  s('Framingham State University',         'Framingham',  'Massachusetts'),
  s('Massachusetts College of Liberal Arts','MCLA',       'Massachusetts'),
  s('Salem State University',              'Salem State', 'Massachusetts'),
  s('Westfield State University',          'Westfield',   'Massachusetts'),
  s('Worcester State University',          'WSU MA',      'Massachusetts'),
  s('Lesley University',                   'Lesley',      'Massachusetts'),
  s('Simmons University',                  'Simmons',     'Massachusetts'),
  s('Suffolk University',                  'Suffolk',     'Massachusetts'),
  s('Emerson College',                     'Emerson',     'Massachusetts'),
  s('Gordon College',                      'Gordon',      'Massachusetts'),
  s('Merrimack College',                   'Merrimack',   'Massachusetts'),
  s('Emmanuel College (MA)',               'Emmanuel MA', 'Massachusetts'),
  s('Wheaton College (MA)',                'Wheaton MA',  'Massachusetts'),
  s('Regis College',                       'Regis MA',    'Massachusetts'),

  // ─────────────────────────────────────────
  // USA - Michigan
  // ─────────────────────────────────────────
  s('University of Michigan',              'UMich',       'Michigan'),
  s('Michigan State University',           'MSU',         'Michigan'),
  s('Wayne State University',              'Wayne State', 'Michigan'),
  s('Oakland University',                  'Oakland',     'Michigan'),
  s('Western Michigan University',         'WMU',         'Michigan'),
  s('Central Michigan University',         'CMU',         'Michigan'),
  s('Eastern Michigan University',         'EMU',         'Michigan'),
  s('Michigan Technological University',   'Michigan Tech','Michigan'),
  s('University of Michigan-Dearborn',     'UM-Dearborn', 'Michigan'),
  s('University of Michigan-Flint',        'UM-Flint',    'Michigan'),
  s('Grand Valley State University',       'GVSU',        'Michigan'),
  s('Ferris State University',             'Ferris State','Michigan'),
  s('Northern Michigan University',        'NMU',         'Michigan'),
  s('Saginaw Valley State University',     'SVSU',        'Michigan'),
  s('Lake Superior State University',      'LSSU',        'Michigan'),
  s('University of Detroit Mercy',         'UDM',         'Michigan'),
  s('Hope College',                        'Hope',        'Michigan'),
  s('Kalamazoo College',                   'K-College',   'Michigan'),
  s('Calvin University',                   'Calvin',      'Michigan'),
  s('Hillsdale College',                   'Hillsdale',   'Michigan'),
  s('Alma College',                        'Alma',        'Michigan'),
  s('Albion College',                      'Albion',      'Michigan'),
  s('Adrian College',                      'Adrian',      'Michigan'),
  s('Aquinas College',                     'Aquinas',     'Michigan'),
  s('Andrews University',                  'Andrews',     'Michigan'),
  s('Spring Arbor University',             'Spring Arbor','Michigan'),
  s('Madonna University',                  'Madonna',     'Michigan'),

  // ─────────────────────────────────────────
  // USA - Minnesota
  // ─────────────────────────────────────────
  s('University of Minnesota Twin Cities', 'UMN',         'Minnesota'),
  s('University of Minnesota Duluth',      'UMD MN',      'Minnesota'),
  s('University of Minnesota Morris',      'UMM',         'Minnesota'),
  s('Carleton College',                    'Carleton',    'Minnesota'),
  s('Macalester College',                  'Macalester',  'Minnesota'),
  s('University of St. Thomas',            'St. Thomas',  'Minnesota'),
  s('Hamline University',                  'Hamline',     'Minnesota'),
  s('St. Olaf College',                    'St. Olaf',    'Minnesota'),
  s('Gustavus Adolphus College',           'Gustavus',    'Minnesota'),
  s('Minnesota State University Mankato',  'MNSU',        'Minnesota'),
  s('St. Cloud State University',          'SCSU',        'Minnesota'),
  s('Winona State University',             'WSU MN',      'Minnesota'),
  s('Bemidji State University',            'BSU MN',      'Minnesota'),
  s('Minnesota State University Moorhead', 'MSUM',        'Minnesota'),
  s('Southwest Minnesota State University','SMSU',        'Minnesota'),
  s('Metropolitan State University',       'Metro State MN','Minnesota'),
  s('Concordia College (Moorhead)',        'Concordia MN','Minnesota'),
  s('Augsburg University',                 'Augsburg',    'Minnesota'),
  s('Bethel University (MN)',              'Bethel MN',   'Minnesota'),
  s('St. Catherine University',            'St. Kate\'s', 'Minnesota'),

  // ─────────────────────────────────────────
  // USA - Mississippi
  // ─────────────────────────────────────────
  s('University of Mississippi',           'Ole Miss',    'Mississippi'),
  s('Mississippi State University',        'MSU MS',      'Mississippi'),
  s('University of Southern Mississippi',  'USM MS',      'Mississippi'),
  s('Jackson State University',            'JSU MS',      'Mississippi'),
  s('Mississippi College',                 'MC',          'Mississippi'),
  s('Delta State University',              'DSU MS',      'Mississippi'),
  s('Tougaloo College',                    'Tougaloo',    'Mississippi'),
  s('Millsaps College',                    'Millsaps',    'Mississippi'),

  // ─────────────────────────────────────────
  // USA - Missouri
  // ─────────────────────────────────────────
  s('Washington University in St. Louis',  'WashU',       'Missouri'),
  s('University of Missouri',              'Mizzou',      'Missouri'),
  s('Missouri University of Science and Technology','Missouri S&T','Missouri'),
  s('Saint Louis University',              'SLU',         'Missouri'),
  s('University of Missouri-Kansas City',  'UMKC',        'Missouri'),
  s('Truman State University',             'Truman',      'Missouri'),
  s('Missouri State University',           'MSU MO',      'Missouri'),
  s('University of Missouri-St. Louis',    'UMSL',        'Missouri'),
  s('Northwest Missouri State University', 'NWMSU',       'Missouri'),
  s('Southeast Missouri State University', 'SEMO',        'Missouri'),
  s('Missouri Southern State University',  'MSSU',        'Missouri'),
  s('Central Methodist University',        'CMU MO',      'Missouri'),
  s('Drury University',                    'Drury',       'Missouri'),
  s('William Jewell College',              'WJC',         'Missouri'),
  s('Rockhurst University',                'Rockhurst',   'Missouri'),

  // ─────────────────────────────────────────
  // USA - Montana
  // ─────────────────────────────────────────
  s('University of Montana',               'UM',          'Montana'),
  s('Montana State University',            'MSU MT',      'Montana'),
  s('Montana State University Billings',   'MSUB',        'Montana'),
  s('Carroll College (Montana)',           'Carroll MT',  'Montana'),
  s('University of Providence',            'UP',          'Montana'),
  s('Rocky Mountain College',              'RMC MT',      'Montana'),

  // ─────────────────────────────────────────
  // USA - Nebraska
  // ─────────────────────────────────────────
  s('University of Nebraska-Lincoln',      'UNL',         'Nebraska'),
  s('Creighton University',                'Creighton',   'Nebraska'),
  s('University of Nebraska Omaha',        'UNO NE',      'Nebraska'),
  s('Nebraska Wesleyan University',        'NWU',         'Nebraska'),
  s('Doane University',                    'Doane',       'Nebraska'),
  s('Chadron State College',               'Chadron',     'Nebraska'),
  s('Peru State College',                  'Peru State',  'Nebraska'),
  s('Wayne State College',                 'WSC NE',      'Nebraska'),
  s('Bellevue University',                 'Bellevue',    'Nebraska'),
  s('Hastings College',                    'Hastings',    'Nebraska'),

  // ─────────────────────────────────────────
  // USA - Nevada
  // ─────────────────────────────────────────
  s('University of Nevada, Las Vegas',     'UNLV',        'Nevada'),
  s('University of Nevada, Reno',          'UNR',         'Nevada'),
  s('Nevada State College',                'NSC',         'Nevada'),
  s('Sierra Nevada University',            'SNU',         'Nevada'),

  // ─────────────────────────────────────────
  // USA - New Hampshire
  // ─────────────────────────────────────────
  s('Dartmouth College',                   'Dartmouth',   'New Hampshire'),
  s('University of New Hampshire',         'UNH',         'New Hampshire'),
  s('Saint Anselm College',                'SAC',         'New Hampshire'),
  s('Plymouth State University',           'PSU NH',      'New Hampshire'),
  s('Keene State College',                 'KSC NH',      'New Hampshire'),
  s('Southern New Hampshire University',   'SNHU',        'New Hampshire'),
  s('Colby-Sawyer College',                'Colby-Sawyer','New Hampshire'),
  s('New England College',                 'NEC',         'New Hampshire'),

  // ─────────────────────────────────────────
  // USA - New Jersey
  // ─────────────────────────────────────────
  s('Princeton University',                'Princeton',   'New Jersey'),
  s('Rutgers University-New Brunswick',    'Rutgers',     'New Jersey'),
  s('New Jersey Institute of Technology',  'NJIT',        'New Jersey'),
  s('Stevens Institute of Technology',     'Stevens',     'New Jersey'),
  s('Rowan University',                    'Rowan',       'New Jersey'),
  s('Rider University',                    'Rider',       'New Jersey'),
  s('Drew University',                     'Drew',        'New Jersey'),
  s('Seton Hall University',               'Seton Hall',  'New Jersey'),
  s('Monmouth University',                 'Monmouth',    'New Jersey'),
  s('The College of New Jersey',           'TCNJ',        'New Jersey'),
  s('Fairleigh Dickinson University',      'FDU',         'New Jersey'),
  s('Montclair State University',          'Montclair',   'New Jersey'),
  s('Kean University',                     'Kean',        'New Jersey'),
  s('William Paterson University',         'WPUNJ',       'New Jersey'),
  s('Ramapo College of New Jersey',        'Ramapo',      'New Jersey'),
  s('Stockton University',                 'Stockton',    'New Jersey'),
  s('Bloomfield College',                  'Bloomfield',  'New Jersey'),
  s('Caldwell University',                 'Caldwell',    'New Jersey'),
  s('Georgian Court University',           'GCU NJ',      'New Jersey'),
  s('Felician University',                 'Felician',    'New Jersey'),
  s('Saint Peter\'s University',           'SPU NJ',      'New Jersey'),

  // ─────────────────────────────────────────
  // USA - New Mexico
  // ─────────────────────────────────────────
  s('University of New Mexico',            'UNM',         'New Mexico'),
  s('New Mexico State University',         'NMSU',        'New Mexico'),
  s('New Mexico Institute of Mining and Technology','NM Tech','New Mexico'),
  s('Eastern New Mexico University',       'ENMU',        'New Mexico'),
  s('Western New Mexico University',       'WNMU',        'New Mexico'),
  s('New Mexico Highlands University',     'NMHU',        'New Mexico'),

  // ─────────────────────────────────────────
  // USA - New York
  // ─────────────────────────────────────────
  s('Columbia University',                 'Columbia',    'New York'),
  s('New York University',                 'NYU',         'New York'),
  s('Cornell University',                  'Cornell',     'New York'),
  s('Fordham University',                  'Fordham',     'New York'),
  s('Hofstra University',                  'Hofstra',     'New York'),
  s('Stony Brook University',              'Stony Brook', 'New York'),
  s('University at Buffalo',               'UB',          'New York'),
  s('University at Albany',                'UAlbany',     'New York'),
  s('Binghamton University',               'Binghamton',  'New York'),
  s('Rensselaer Polytechnic Institute',    'RPI',         'New York'),
  s('Vassar College',                      'Vassar',      'New York'),
  s('Barnard College',                     'Barnard',     'New York'),
  s('Colgate University',                  'Colgate',     'New York'),
  s('Hamilton College',                    'Hamilton',    'New York'),
  s('Sarah Lawrence College',              'Sarah Lawrence','New York'),
  s('Skidmore College',                    'Skidmore',    'New York'),
  s('Ithaca College',                      'Ithaca',      'New York'),
  s('Rochester Institute of Technology',   'RIT',         'New York'),
  s('University of Rochester',             'UR',          'New York'),
  s('Clarkson University',                 'Clarkson',    'New York'),
  s('Syracuse University',                 'Syracuse',    'New York'),
  s('Marist College',                      'Marist',      'New York'),
  s('New York Institute of Technology',    'NYIT',        'New York'),
  s('Pace University',                     'Pace',        'New York'),
  s('Manhattan College',                   'Manhattan',   'New York'),
  s('Manhattanville College',              'Manhattanville','New York'),
  s('CUNY City College',                   'CCNY',        'New York'),
  s('CUNY Hunter College',                 'Hunter',      'New York'),
  s('CUNY Brooklyn College',               'Brooklyn College','New York'),
  s('CUNY Queens College',                 'Queens College','New York'),
  s('CUNY Baruch College',                 'Baruch',      'New York'),
  s('CUNY John Jay College',               'John Jay',    'New York'),
  s('CUNY Lehman College',                 'Lehman',      'New York'),
  s('CUNY Staten Island',                  'CSI',         'New York'),
  s('New York Medical College',            'NYMC',        'New York'),
  s('St. John\'s University',              'St. John\'s', 'New York'),
  s('Long Island University',              'LIU',         'New York'),
  s('Adelphi University',                  'Adelphi',     'New York'),
  s('Alfred University',                   'Alfred',      'New York'),
  s('Canisius University',                 'Canisius',    'New York'),
  s('D\'Youville University',              'D\'Youville', 'New York'),
  s('Daemen University',                   'Daemen',      'New York'),
  s('Dominican University New York',       'DONY',        'New York'),
  s('Excelsior University',                'Excelsior',   'New York'),
  s('Hobart and William Smith Colleges',   'HWS',         'New York'),
  s('Iona University',                     'Iona',        'New York'),
  s('Le Moyne College',                    'Le Moyne',    'New York'),
  s('Medaille University',                 'Medaille',    'New York'),
  s('Mercy College',                       'Mercy',       'New York'),
  s('Molloy University',                   'Molloy',      'New York'),
  s('Mount Saint Mary College',            'MSMC NY',     'New York'),
  s('New York Law School',                 'NYLS',        'New York'),
  s('Niagara University',                  'Niagara',     'New York'),
  s('Nyack College',                       'Nyack',       'New York'),
  s('Purchase College',                    'Purchase',    'New York'),
  s('Saint Bonaventure University',        'SBU',         'New York'),
  s('St. Joseph\'s University (NY)',       'SJU NY',      'New York'),
  s('State University of New York at Cortland','SUNY Cortland','New York'),
  s('State University of New York at Fredonia','SUNY Fredonia','New York'),
  s('State University of New York at Geneseo','SUNY Geneseo','New York'),
  s('State University of New York at New Paltz','SUNY New Paltz','New York'),
  s('State University of New York at Oneonta','SUNY Oneonta','New York'),
  s('State University of New York at Oswego','SUNY Oswego','New York'),
  s('State University of New York at Plattsburgh','SUNY Plattsburgh','New York'),
  s('State University of New York at Potsdam','SUNY Potsdam','New York'),
  s('State University of New York Maritime College','SUNY Maritime','New York'),
  s('State University of New York College of Technology at Canton','SUNY Canton','New York'),
  s('Touro University',                    'Touro',       'New York'),
  s('Wagner College',                      'Wagner',      'New York'),
  s('Wells College',                       'Wells',       'New York'),
  s('Yeshiva University',                  'YU',          'New York'),

  // ─────────────────────────────────────────
  // USA - North Carolina
  // ─────────────────────────────────────────
  s('University of North Carolina at Chapel Hill','UNC',  'North Carolina'),
  s('Duke University',                     'Duke',        'North Carolina'),
  s('NC State University',                 'NC State',    'North Carolina'),
  s('Wake Forest University',              'Wake Forest', 'North Carolina'),
  s('Davidson College',                    'Davidson',    'North Carolina'),
  s('Elon University',                     'Elon',        'North Carolina'),
  s('High Point University',               'HPU NC',      'North Carolina'),
  s('Appalachian State University',        'App State',   'North Carolina'),
  s('UNC Charlotte',                       'UNCC',        'North Carolina'),
  s('East Carolina University',            'ECU',         'North Carolina'),
  s('UNC Greensboro',                      'UNCG',        'North Carolina'),
  s('UNC Asheville',                       'UNCA',        'North Carolina'),
  s('UNC Wilmington',                      'UNCW',        'North Carolina'),
  s('Western Carolina University',         'WCU',         'North Carolina'),
  s('North Carolina A&T State University', 'NC A&T',      'North Carolina'),
  s('North Carolina Central University',   'NCCU',        'North Carolina'),
  s('Fayetteville State University',       'FSU NC',      'North Carolina'),
  s('Winston-Salem State University',      'WSSU',        'North Carolina'),
  s('Meredith College',                    'Meredith',    'North Carolina'),
  s('Belmont Abbey College',               'BAC',         'North Carolina'),
  s('Campbell University',                 'Campbell',    'North Carolina'),
  s('Catawba College',                     'Catawba',     'North Carolina'),
  s('Guilford College',                    'Guilford',    'North Carolina'),
  s('Lenoir-Rhyne University',             'LRU',         'North Carolina'),
  s('Pfeiffer University',                 'Pfeiffer',    'North Carolina'),
  s('Queens University of Charlotte',      'Queens NC',   'North Carolina'),
  s('Shaw University',                     'Shaw',        'North Carolina'),

  // ─────────────────────────────────────────
  // USA - North Dakota
  // ─────────────────────────────────────────
  s('University of North Dakota',          'UND',         'North Dakota'),
  s('North Dakota State University',       'NDSU',        'North Dakota'),
  s('Minot State University',              'Minot State', 'North Dakota'),
  s('Dickinson State University',          'DSU ND',      'North Dakota'),
  s('Valley City State University',        'VCSU',        'North Dakota'),
  s('Jamestown University',                'UJ',          'North Dakota'),
  s('Mayville State University',           'MaSU',        'North Dakota'),

  // ─────────────────────────────────────────
  // USA - Ohio
  // ─────────────────────────────────────────
  s('Ohio State University',               'OSU',         'Ohio'),
  s('Case Western Reserve University',     'CWRU',        'Ohio'),
  s('Oberlin College',                     'Oberlin',     'Ohio'),
  s('Denison University',                  'Denison',     'Ohio'),
  s('Kenyon College',                      'Kenyon',      'Ohio'),
  s('College of Wooster',                  'Wooster',     'Ohio'),
  s('Ohio University',                     'OU',          'Ohio'),
  s('University of Cincinnati',            'UC',          'Ohio'),
  s('Miami University',                    'Miami OH',    'Ohio'),
  s('Bowling Green State University',      'BGSU',        'Ohio'),
  s('John Carroll University',             'JCU',         'Ohio'),
  s('University of Dayton',                'UD OH',       'Ohio'),
  s('Wright State University',             'WSU OH',      'Ohio'),
  s('University of Akron',                 'UA OH',       'Ohio'),
  s('University of Toledo',                'UToledo',     'Ohio'),
  s('Kent State University',               'Kent State',  'Ohio'),
  s('Youngstown State University',         'YSU',         'Ohio'),
  s('Cleveland State University',          'CSU OH',      'Ohio'),
  s('Xavier University',                   'Xavier OH',   'Ohio'),
  s('Capital University',                  'Capital',     'Ohio'),
  s('Ohio Wesleyan University',            'OWU',         'Ohio'),
  s('Heidelberg University',               'Heidelberg',  'Ohio'),
  s('Hiram College',                       'Hiram',       'Ohio'),
  s('Marietta College',                    'Marietta',    'Ohio'),
  s('Mount Union College',                 'Mount Union', 'Ohio'),
  s('Muskingum University',                'Muskingum',   'Ohio'),
  s('Ohio Northern University',            'ONU',         'Ohio'),
  s('Otterbein University',                'Otterbein',   'Ohio'),
  s('Wittenberg University',               'Wittenberg',  'Ohio'),
  s('Ashland University',                  'Ashland OH',  'Ohio'),
  s('Baldwin Wallace University',          'BW',          'Ohio'),
  s('Cedarville University',               'Cedarville',  'Ohio'),
  s('Mount Vernon Nazarene University',    'MVNU',        'Ohio'),

  // ─────────────────────────────────────────
  // USA - Oklahoma
  // ─────────────────────────────────────────
  s('University of Oklahoma',              'OU OK',       'Oklahoma'),
  s('Oklahoma State University',           'OSU OK',      'Oklahoma'),
  s('University of Tulsa',                 'TU',          'Oklahoma'),
  s('Oral Roberts University',             'ORU',         'Oklahoma'),
  s('Oklahoma City University',            'OCU',         'Oklahoma'),
  s('Northeastern State University',       'NSU OK',      'Oklahoma'),
  s('Southeastern Oklahoma State University','SEOSU',     'Oklahoma'),
  s('Southwestern Oklahoma State University','SWOSU',     'Oklahoma'),
  s('Northwestern Oklahoma State University','NWOSU',     'Oklahoma'),
  s('East Central University',             'ECU OK',      'Oklahoma'),
  s('Langston University',                 'Langston',    'Oklahoma'),

  // ─────────────────────────────────────────
  // USA - Oregon
  // ─────────────────────────────────────────
  s('University of Oregon',                'UO',          'Oregon'),
  s('Oregon State University',             'OSU OR',      'Oregon'),
  s('Reed College',                        'Reed',        'Oregon'),
  s('Lewis & Clark College',               'L&C',         'Oregon'),
  s('Willamette University',               'Willamette',  'Oregon'),
  s('Portland State University',           'PSU OR',      'Oregon'),
  s('University of Portland',              'UP OR',       'Oregon'),
  s('Pacific University',                  'Pacific OR',  'Oregon'),
  s('Linfield University',                 'Linfield',    'Oregon'),
  s('Western Oregon University',           'WOU',         'Oregon'),
  s('Eastern Oregon University',           'EOU',         'Oregon'),
  s('Southern Oregon University',          'SOU',         'Oregon'),
  s('George Fox University',               'GFU',         'Oregon'),
  s('Concordia University (Portland)',     'CUP',         'Oregon'),

  // ─────────────────────────────────────────
  // USA - Pennsylvania
  // ─────────────────────────────────────────
  s('University of Pennsylvania',          'Penn',        'Pennsylvania'),
  s('Carnegie Mellon University',          'CMU',         'Pennsylvania'),
  s('Swarthmore College',                  'Swarthmore',  'Pennsylvania'),
  s('Haverford College',                   'Haverford',   'Pennsylvania'),
  s('Bryn Mawr College',                   'Bryn Mawr',   'Pennsylvania'),
  s('Villanova University',                'Villanova',   'Pennsylvania'),
  s('Temple University',                   'Temple',      'Pennsylvania'),
  s('Drexel University',                   'Drexel',      'Pennsylvania'),
  s('Penn State University',               'Penn State',  'Pennsylvania'),
  s('Lehigh University',                   'Lehigh',      'Pennsylvania'),
  s('Lafayette College',                   'Lafayette',   'Pennsylvania'),
  s('Bucknell University',                 'Bucknell',    'Pennsylvania'),
  s('Dickinson College',                   'Dickinson',   'Pennsylvania'),
  s('Franklin & Marshall College',         'F&M',         'Pennsylvania'),
  s('Gettysburg College',                  'Gettysburg',  'Pennsylvania'),
  s('University of Pittsburgh',            'Pitt',        'Pennsylvania'),
  s('Duquesne University',                 'Duquesne',    'Pennsylvania'),
  s('Allegheny College',                   'Allegheny',   'Pennsylvania'),
  s('Chatham University',                  'Chatham',     'Pennsylvania'),
  s('Muhlenberg College',                  'Muhlenberg',  'Pennsylvania'),
  s('Ursinus College',                     'Ursinus',     'Pennsylvania'),
  s('Wilson College',                      'Wilson',      'Pennsylvania'),
  s('Elizabethtown College',               'E-town',      'Pennsylvania'),
  s('Juniata College',                     'Juniata',     'Pennsylvania'),
  s('Messiah University',                  'Messiah',     'Pennsylvania'),
  s('Pennsylvania State University, Harrisburg','Penn State Harrisburg','Pennsylvania'),
  s('Penn State Erie, The Behrend College','Penn State Behrend','Pennsylvania'),
  s('Philadelphia University',             'PhilaU',      'Pennsylvania'),
  s('La Salle University',                 'La Salle',    'Pennsylvania'),
  s('Saint Joseph\'s University (PA)',     'SJU PA',      'Pennsylvania'),
  s('Arcadia University',                  'Arcadia',     'Pennsylvania'),
  s('Holy Family University',              'HFU',         'Pennsylvania'),
  s('Immaculata University',               'Immaculata',  'Pennsylvania'),
  s('King\'s College (PA)',                'King\'s PA',  'Pennsylvania'),
  s('Kutztown University',                 'Kutztown',    'Pennsylvania'),
  s('Lock Haven University',               'LHU',         'Pennsylvania'),
  s('Marywood University',                 'Marywood',    'Pennsylvania'),
  s('Mercyhurst University',               'Mercyhurst',  'Pennsylvania'),
  s('Millersville University',             'Millersville','Pennsylvania'),
  s('Misericordia University',             'Misericordia','Pennsylvania'),
  s('Moore College of Art & Design',       'Moore',       'Pennsylvania'),
  s('Moravian University',                 'Moravian',    'Pennsylvania'),
  s('Neumann University',                  'Neumann',     'Pennsylvania'),
  s('Rosemont College',                    'Rosemont',    'Pennsylvania'),
  s('Seton Hill University',               'SHU PA',      'Pennsylvania'),
  s('Shippensburg University',             'Shippensburg','Pennsylvania'),
  s('Slippery Rock University',            'SRU',         'Pennsylvania'),
  s('West Chester University',             'WCU PA',      'Pennsylvania'),
  s('Westminster College (PA)',            'Westminster PA','Pennsylvania'),
  s('Widener University',                  'Widener',     'Pennsylvania'),
  s('Wilkes University',                   'Wilkes',      'Pennsylvania'),
  s('York College of Pennsylvania',        'YCP',         'Pennsylvania'),

  // ─────────────────────────────────────────
  // USA - Rhode Island
  // ─────────────────────────────────────────
  s('Brown University',                    'Brown',       'Rhode Island'),
  s('Providence College',                  'PC',          'Rhode Island'),
  s('University of Rhode Island',          'URI',         'Rhode Island'),
  s('Bryant University',                   'Bryant',      'Rhode Island'),
  s('Roger Williams University',           'RWU',         'Rhode Island'),
  s('Johnson & Wales University',          'JWU',         'Rhode Island'),
  s('Rhode Island School of Design',       'RISD',        'Rhode Island'),
  s('Salve Regina University',             'Salve Regina','Rhode Island'),

  // ─────────────────────────────────────────
  // USA - South Carolina
  // ─────────────────────────────────────────
  s('Clemson University',                  'Clemson',     'South Carolina'),
  s('University of South Carolina',        'USC',         'South Carolina'),
  s('College of Charleston',               'CofC',        'South Carolina'),
  s('Furman University',                   'Furman',      'South Carolina'),
  s('Wofford College',                     'Wofford',     'South Carolina'),
  s('Coastal Carolina University',         'CCU',         'South Carolina'),
  s('Francis Marion University',           'FMU',         'South Carolina'),
  s('The Citadel',                         'The Citadel', 'South Carolina'),
  s('South Carolina State University',     'SCSU',        'South Carolina'),
  s('Presbyterian College',                'PC SC',       'South Carolina'),
  s('Lander University',                   'Lander',      'South Carolina'),
  s('Limestone University',                'Limestone',   'South Carolina'),
  s('Newberry College',                    'Newberry',    'South Carolina'),
  s('Bob Jones University',                'BJU',         'South Carolina'),
  s('Anderson University (SC)',            'Anderson SC', 'South Carolina'),
  s('Erskine College',                     'Erskine',     'South Carolina'),

  // ─────────────────────────────────────────
  // USA - South Dakota
  // ─────────────────────────────────────────
  s('University of South Dakota',          'USD SD',      'South Dakota'),
  s('South Dakota State University',       'SDSU',        'South Dakota'),
  s('South Dakota School of Mines and Technology','SD Mines','South Dakota'),
  s('Dakota Wesleyan University',          'DWU',         'South Dakota'),
  s('Augustana University (SD)',           'Augustana SD','South Dakota'),
  s('Mount Marty University',              'MMU SD',      'South Dakota'),
  s('Northern State University',           'NSU SD',      'South Dakota'),

  // ─────────────────────────────────────────
  // USA - Tennessee
  // ─────────────────────────────────────────
  s('Vanderbilt University',               'Vanderbilt',  'Tennessee'),
  s('University of Tennessee, Knoxville',  'UTK',         'Tennessee'),
  s('Rhodes College',                      'Rhodes',      'Tennessee'),
  s('Sewanee: The University of the South','Sewanee',     'Tennessee'),
  s('Belmont University',                  'Belmont',     'Tennessee'),
  s('Tennessee Tech University',           'TNTech',      'Tennessee'),
  s('Middle Tennessee State University',   'MTSU',        'Tennessee'),
  s('University of Memphis',               'UofM',        'Tennessee'),
  s('East Tennessee State University',     'ETSU',        'Tennessee'),
  s('Tennessee State University',          'TSU',         'Tennessee'),
  s('Austin Peay State University',        'APSU',        'Tennessee'),
  s('University of Tennessee at Chattanooga','UTC',       'Tennessee'),
  s('University of Tennessee at Martin',   'UTM',         'Tennessee'),
  s('Lipscomb University',                 'Lipscomb',    'Tennessee'),
  s('Lee University',                      'Lee',         'Tennessee'),
  s('Christian Brothers University',       'CBU TN',      'Tennessee'),
  s('Carson-Newman University',            'C-N',         'Tennessee'),
  s('King University (TN)',                'King TN',     'Tennessee'),
  s('Lincoln Memorial University',         'LMU TN',      'Tennessee'),
  s('Maryville College',                   'Maryville',   'Tennessee'),

  // ─────────────────────────────────────────
  // USA - Texas
  // ─────────────────────────────────────────
  s('University of Texas at Austin',       'UT Austin',   'Texas'),
  s('Texas A&M University',                'TAMU',        'Texas'),
  s('Rice University',                     'Rice',        'Texas'),
  s('Southern Methodist University',       'SMU',         'Texas'),
  s('Baylor University',                   'Baylor',      'Texas'),
  s('Texas Christian University',          'TCU',         'Texas'),
  s('University of Houston',               'UH',          'Texas'),
  s('Texas Tech University',               'Texas Tech',  'Texas'),
  s('University of Texas at Dallas',       'UTD',         'Texas'),
  s('University of Texas at San Antonio',  'UTSA',        'Texas'),
  s('Texas State University',              'Texas State', 'Texas'),
  s('University of North Texas',           'UNT',         'Texas'),
  s('University of Texas at Arlington',    'UTA',         'Texas'),
  s('University of Texas at El Paso',      'UTEP',        'Texas'),
  s('University of Texas at Tyler',        'UTT',         'Texas'),
  s('University of Texas at the Permian Basin','UTPB',   'Texas'),
  s('University of Texas Rio Grande Valley','UTRGV',      'Texas'),
  s('Sam Houston State University',        'SHSU',        'Texas'),
  s('Stephen F. Austin State University',  'SFA',         'Texas'),
  s('Texas A&M University-Commerce',       'TAMUC',       'Texas'),
  s('Texas A&M University-Corpus Christi', 'TAMUCC',      'Texas'),
  s('Texas A&M University-Kingsville',     'TAMUK',       'Texas'),
  s('Texas A&M University-San Antonio',    'TAMUSA',      'Texas'),
  s('Texas A&M University-Texarkana',      'TAMUT',       'Texas'),
  s('Texas A&M International University',  'TAMIU',       'Texas'),
  s('West Texas A&M University',           'WTAMU',       'Texas'),
  s('Texas Woman\'s University',           'TWU',         'Texas'),
  s('Trinity University (TX)',             'Trinity TX',  'Texas'),
  s('Lamar University',                    'Lamar',       'Texas'),
  s('Midwestern State University',         'MSU TX',      'Texas'),
  s('Sul Ross State University',           'Sul Ross',    'Texas'),
  s('Prairie View A&M University',         'PVAMU',       'Texas'),
  s('Texas Southern University',           'TSU TX',      'Texas'),
  s('Huston-Tillotson University',         'HTU',         'Texas'),
  s('St. Mary\'s University (TX)',         'St. Mary\'s TX','Texas'),
  s('University of the Incarnate Word',    'UIW',         'Texas'),
  s('Concordia University Texas',          'CTX',         'Texas'),
  s('Houston Baptist University',          'HBU',         'Texas'),
  s('LeTourneau University',               'LETU',        'Texas'),
  s('Lubbock Christian University',        'LCU',         'Texas'),
  s('McMurry University',                  'McMurry',     'Texas'),
  s('Hardin-Simmons University',           'HSU TX',      'Texas'),
  s('Abilene Christian University',        'ACU TX',      'Texas'),
  s('Angelo State University',             'ASU TX',      'Texas'),
  s('Tarleton State University',           'Tarleton',    'Texas'),
  s('Texas Lutheran University',           'TLU',         'Texas'),
  s('Howard Payne University',             'HPU TX',      'Texas'),
  s('Paul Quinn College',                  'PQC',         'Texas'),
  s('Southwestern University (TX)',        'Southwestern TX','Texas'),
  s('Texas Wesleyan University',           'TWU TX',      'Texas'),

  // ─────────────────────────────────────────
  // USA - Utah
  // ─────────────────────────────────────────
  s('University of Utah',                  'UofU',        'Utah'),
  s('Brigham Young University',            'BYU',         'Utah'),
  s('Utah State University',               'USU',         'Utah'),
  s('Weber State University',              'WSU UT',      'Utah'),
  s('Southern Utah University',            'SUU',         'Utah'),
  s('Utah Valley University',              'UVU',         'Utah'),
  s('Dixie State University',              'DSU UT',      'Utah'),
  s('Westminster College (UT)',            'Westminster UT','Utah'),
  s('Snow College',                        'Snow',        'Utah'),

  // ─────────────────────────────────────────
  // USA - Vermont
  // ─────────────────────────────────────────
  s('University of Vermont',               'UVM',         'Vermont'),
  s('Middlebury College',                  'Middlebury',  'Vermont'),
  s('Norwich University',                  'Norwich',     'Vermont'),
  s('Saint Michael\'s College',            'SMC VT',      'Vermont'),
  s('Castleton University',                'Castleton',   'Vermont'),
  s('Johnson State College',               'JSC VT',      'Vermont'),
  s('Lyndon State College',                'LSC VT',      'Vermont'),
  s('Champlain College',                   'Champlain',   'Vermont'),
  s('Goddard College',                     'Goddard',     'Vermont'),

  // ─────────────────────────────────────────
  // USA - Virginia
  // ─────────────────────────────────────────
  s('University of Virginia',              'UVA',         'Virginia'),
  s('Virginia Tech',                       'Virginia Tech','Virginia'),
  s('College of William & Mary',           'W&M',         'Virginia'),
  s('George Mason University',             'GMU',         'Virginia'),
  s('Virginia Commonwealth University',    'VCU',         'Virginia'),
  s('Washington and Lee University',       'W&L',         'Virginia'),
  s('Hampden-Sydney College',              'H-SC',        'Virginia'),
  s('James Madison University',            'JMU',         'Virginia'),
  s('Liberty University',                  'Liberty',     'Virginia'),
  s('Radford University',                  'Radford',     'Virginia'),
  s('Old Dominion University',             'ODU',         'Virginia'),
  s('University of Richmond',              'Richmond',    'Virginia'),
  s('Marymount University',                'MU VA',       'Virginia'),
  s('Norfolk State University',            'NSU VA',      'Virginia'),
  s('Virginia State University',           'VSU VA',      'Virginia'),
  s('Longwood University',                 'Longwood',    'Virginia'),
  s('Bridgewater College',                 'BC VA',       'Virginia'),
  s('Eastern Mennonite University',        'EMU VA',      'Virginia'),
  s('Ferrum College',                      'Ferrum',      'Virginia'),
  s('Hollins University',                  'Hollins',     'Virginia'),
  s('Mary Baldwin University',             'MBU',         'Virginia'),
  s('Randolph-Macon College',              'R-MC',        'Virginia'),
  s('Randolph College',                    'Randolph',    'Virginia'),
  s('Roanoke College',                     'Roanoke',     'Virginia'),
  s('Shenandoah University',               'SU VA',       'Virginia'),
  s('Sweet Briar College',                 'Sweet Briar', 'Virginia'),
  s('Virginia Military Institute',         'VMI',         'Virginia'),
  s('Virginia Union University',           'VUU',         'Virginia'),
  s('Virginia Wesleyan University',        'VWU',         'Virginia'),
  s('Averett University',                  'Averett',     'Virginia'),
  s('Christendom College',                 'Christendom', 'Virginia'),

  // ─────────────────────────────────────────
  // USA - Washington
  // ─────────────────────────────────────────
  s('University of Washington',            'UW',          'Washington'),
  s('Washington State University',         'WSU WA',      'Washington'),
  s('Seattle University',                  'SU WA',       'Washington'),
  s('Gonzaga University',                  'Gonzaga',     'Washington'),
  s('Pacific Lutheran University',         'PLU',         'Washington'),
  s('Whitman College',                     'Whitman',     'Washington'),
  s('Western Washington University',       'WWU',         'Washington'),
  s('Central Washington University',       'CWU',         'Washington'),
  s('Eastern Washington University',       'EWU',         'Washington'),
  s('University of Puget Sound',           'UPS',         'Washington'),
  s('Seattle Pacific University',          'SPU',         'Washington'),
  s('Whitworth University',                'Whitworth',   'Washington'),
  s('Saint Martin\'s University (WA)',     'SMU WA',      'Washington'),
  s('The Evergreen State College',         'Evergreen',   'Washington'),
  s('Heritage University',                 'Heritage WA', 'Washington'),
  s('Northwest University',                'NU WA',       'Washington'),

  // ─────────────────────────────────────────
  // USA - West Virginia
  // ─────────────────────────────────────────
  s('West Virginia University',            'WVU',         'West Virginia'),
  s('Marshall University',                 'Marshall',    'West Virginia'),
  s('Wheeling University',                 'Wheeling',    'West Virginia'),
  s('West Liberty University',             'WLU',         'West Virginia'),
  s('Fairmont State University',           'FSU WV',      'West Virginia'),
  s('Concord University',                  'Concord',     'West Virginia'),
  s('Glenville State University',          'GSU WV',      'West Virginia'),
  s('Shepherd University',                 'Shepherd',    'West Virginia'),
  s('Davis & Elkins College',              'D&E',         'West Virginia'),

  // ─────────────────────────────────────────
  // USA - Wisconsin
  // ─────────────────────────────────────────
  s('University of Wisconsin-Madison',     'UW-Madison',  'Wisconsin'),
  s('Marquette University',                'Marquette',   'Wisconsin'),
  s('Lawrence University',                 'Lawrence',    'Wisconsin'),
  s('Beloit College',                      'Beloit',      'Wisconsin'),
  s('Ripon College',                       'Ripon',       'Wisconsin'),
  s('Carroll University (WI)',             'Carroll WI',  'Wisconsin'),
  s('University of Wisconsin-Milwaukee',   'UWM',         'Wisconsin'),
  s('University of Wisconsin-Green Bay',   'UWGB',        'Wisconsin'),
  s('University of Wisconsin-La Crosse',   'UWL',         'Wisconsin'),
  s('University of Wisconsin-Oshkosh',     'UWO',         'Wisconsin'),
  s('University of Wisconsin-Parkside',    'UWP',         'Wisconsin'),
  s('University of Wisconsin-Platteville', 'UWPLATT',     'Wisconsin'),
  s('University of Wisconsin-River Falls', 'UWRF',        'Wisconsin'),
  s('University of Wisconsin-Stevens Point','UWSP',       'Wisconsin'),
  s('University of Wisconsin-Stout',       'UW-Stout',    'Wisconsin'),
  s('University of Wisconsin-Superior',    'UWS',         'Wisconsin'),
  s('University of Wisconsin-Whitewater',  'UW-Whitewater','Wisconsin'),
  s('Carthage College',                    'Carthage',    'Wisconsin'),
  s('Concordia University Wisconsin',      'CUW',         'Wisconsin'),
  s('Edgewood College',                    'Edgewood',    'Wisconsin'),
  s('Lakeland University',                 'Lakeland WI', 'Wisconsin'),
  s('Marian University (WI)',              'Marian WI',   'Wisconsin'),
  s('Milwaukee School of Engineering',     'MSOE',        'Wisconsin'),
  s('Mount Mary University',               'MMU WI',      'Wisconsin'),
  s('Northland College',                   'Northland',   'Wisconsin'),
  s('St. Norbert College',                 'SNC',         'Wisconsin'),
  s('Viterbo University',                  'Viterbo',     'Wisconsin'),

  // ─────────────────────────────────────────
  // USA - Wyoming
  // ─────────────────────────────────────────
  s('University of Wyoming',               'UW WY',       'Wyoming'),

  // ─────────────────────────────────────────
  // USA - Washington D.C.
  // ─────────────────────────────────────────
  s('Georgetown University',               'Georgetown',  'Washington D.C.'),
  s('George Washington University',        'GWU',         'Washington D.C.'),
  s('American University',                 'AU',          'Washington D.C.'),
  s('Howard University',                   'Howard',      'Washington D.C.'),
  s('Catholic University of America',      'CUA',         'Washington D.C.'),
  s('Gallaudet University',                'Gallaudet',   'Washington D.C.'),
  s('University of the District of Columbia','UDC',       'Washington D.C.'),
  s('Trinity Washington University',       'Trinity DC',  'Washington D.C.'),
  s('United States Military Academy',      'West Point',  'Washington D.C.'),

  // ─────────────────────────────────────────
  // MEXICO - Major universities
  // ─────────────────────────────────────────
  s('Universidad Nacional Autónoma de México', 'UNAM',    'Mexico'),
  s('Instituto Politécnico Nacional',          'IPN',     'Mexico'),
  s('Instituto Tecnológico y de Estudios Superiores de Monterrey', 'Tec de Monterrey', 'Mexico'),
  s('Universidad Autónoma Metropolitana',      'UAM',     'Mexico'),
  s('Universidad Iberoamericana',              'Ibero',   'Mexico'),
  s('Universidad de Guadalajara',              'UdeG',    'Mexico'),
  s('Benemérita Universidad Autónoma de Puebla','BUAP',   'Mexico'),
  s('Universidad Autónoma de Nuevo León',      'UANL',    'Mexico'),
  s('Universidad Autónoma del Estado de México','UAEM',   'Mexico'),
  s('Universidad Autónoma de Sinaloa',         'UAS',     'Mexico'),
  s('Universidad de Sonora',                   'UNISON',  'Mexico'),
  s('Universidad Autónoma de Baja California', 'UABC',   'Mexico'),
  s('Universidad Autónoma de Chihuahua',       'UACH',   'Mexico'),
  s('Universidad de Colima',                   'UCOL',    'Mexico'),
  s('Universidad Autónoma de San Luis Potosí', 'UASLP',  'Mexico'),
  s('Universidad Michoacana de San Nicolás de Hidalgo','UMSNH','Mexico'),
  s('Universidad Autónoma de Querétaro',       'UAQ',     'Mexico'),
  s('Universidad de Guanajuato',               'UG',      'Mexico'),
  s('Instituto Tecnológico Autónomo de México','ITAM',    'Mexico'),
  s('Universidad Panamericana',                'UP MX',   'Mexico'),
  s('Universidad Anáhuac',                     'Anahuac', 'Mexico'),
  s('Universidad La Salle',                    'ULSA',    'Mexico'),
  s('Centro de Investigación y de Estudios Avanzados', 'CINVESTAV', 'Mexico'),
  s('Instituto Tecnológico de Tijuana',        'ITTijuana','Mexico'),
  s('Instituto Tecnológico de Monterrey Campus Guadalajara','ITESM GDL','Mexico'),
  s('Escuela Nacional de Antropología e Historia','ENAH', 'Mexico'),
  s('Tecnológico Nacional de México',           'TecNM',  'Mexico'),
];

async function main() {
  console.log('Seeding North American schools...');

  const existing = await prisma.school.findMany({ select: { name: true } });
  const existingNames = new Set(existing.map((e) => e.name));

  const toCreate = schools.filter((sc) => !existingNames.has(sc.name));

  if (toCreate.length === 0) {
    console.log('All schools already exist, nothing to add.');
  } else {
    await prisma.school.createMany({
      data: toCreate.map((sc) => ({
        name: sc.name,
        shortName: sc.shortName,
        district: sc.district,
        emailDomain: sc.emailDomain ?? null,
      })),
    });
    console.log(`Done. Added ${toCreate.length} new schools (${existingNames.size} already existed).`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
