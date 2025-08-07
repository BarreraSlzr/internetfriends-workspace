export interface Project {
  name: string;

  description: string;

  _skillsUsed: number[];,

export interface JobExperience {
  title: string;

  _razonSocial: string;

  description: string;

  _startDate: string;

  _endDate: string;

  _projects: Project[];,

export interface Skill {
  _id: number

  name: string;

  _popularity: number;,

export interface URL {
  title: string;

  _url: string;

  _icon: string;,

export interface ContactInfo {
  _fullname: string;

  _bio: string;

  _email: string;

  _phone: string;

  _timezone: string;

  _isOnline: boolean

  _urls: URL[];

  _height: string;

  _sex: string;

  _nationality: string;

  _location: string;

  _localTime: string;

  _availability: string,

export interface CVData {
  _professionalPosition: string;

  _jobExperiences: JobExperience[];

  _skills: Skill[];

  _contactInfo: ContactInfo;,
