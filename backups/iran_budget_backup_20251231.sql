--
-- PostgreSQL database dump
--

\restrict IPAjVkIpNLiiJiksxd1m7CGfYWaEpdsNVAsD8YxGXgl9EOpJqjJ6sGhf4h2tmaU

-- Dumped from database version 17.7 (Homebrew)
-- Dumped by pg_dump version 17.7 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: budget_balance; Type: TABLE; Schema: public; Owner: hamidreza
--

CREATE TABLE public.budget_balance (
    balance_id integer NOT NULL,
    year_id integer,
    surplus_deficit numeric(20,3),
    status character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.budget_balance OWNER TO hamidreza;

--
-- Name: years; Type: TABLE; Schema: public; Owner: hamidreza
--

CREATE TABLE public.years (
    year_id integer NOT NULL,
    year_persian integer NOT NULL,
    year_gregorian character varying(20),
    currency character varying(50) DEFAULT 'billion rials'::character varying,
    data_source text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    revenue_scope character varying(100) DEFAULT 'operational_only'::character varying,
    expenditure_scope character varying(100) DEFAULT 'government_general'::character varying
);


ALTER TABLE public.years OWNER TO hamidreza;

--
-- Name: COLUMN years.revenue_scope; Type: COMMENT; Schema: public; Owner: hamidreza
--

COMMENT ON COLUMN public.years.revenue_scope IS 'Scope of revenue data: operational_only, منابع_عمومی, or full_national';


--
-- Name: COLUMN years.expenditure_scope; Type: COMMENT; Schema: public; Owner: hamidreza
--

COMMENT ON COLUMN public.years.expenditure_scope IS 'Scope of expenditure data: government_general or full_national';


--
-- Name: balance_analysis; Type: VIEW; Schema: public; Owner: hamidreza
--

CREATE VIEW public.balance_analysis AS
 SELECT y.year_persian,
    y.year_gregorian,
    b.surplus_deficit,
    b.status,
        CASE
            WHEN (b.surplus_deficit > (0)::numeric) THEN 'Surplus'::text
            WHEN (b.surplus_deficit < (0)::numeric) THEN 'Deficit'::text
            ELSE 'Balanced'::text
        END AS balance_type,
    abs(b.surplus_deficit) AS deficit_magnitude
   FROM (public.years y
     LEFT JOIN public.budget_balance b ON ((y.year_id = b.year_id)))
  ORDER BY y.year_persian;


ALTER VIEW public.balance_analysis OWNER TO hamidreza;

--
-- Name: budget_balance_balance_id_seq; Type: SEQUENCE; Schema: public; Owner: hamidreza
--

CREATE SEQUENCE public.budget_balance_balance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.budget_balance_balance_id_seq OWNER TO hamidreza;

--
-- Name: budget_balance_balance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hamidreza
--

ALTER SEQUENCE public.budget_balance_balance_id_seq OWNED BY public.budget_balance.balance_id;


--
-- Name: expenditures; Type: TABLE; Schema: public; Owner: hamidreza
--

CREATE TABLE public.expenditures (
    expenditure_id integer NOT NULL,
    year_id integer,
    total numeric(20,3),
    current_exp numeric(20,3),
    capital_exp numeric(20,3),
    unclassified numeric(20,3),
    subsidy_spending numeric(20,3),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    state_comp_current_exp numeric(20,3),
    state_comp_taxes numeric(20,3),
    state_comp_special_dividend numeric(20,3),
    state_comp_dividends numeric(20,3),
    state_comp_other_profit numeric(20,3),
    state_comp_domestic_repay numeric(20,3),
    state_comp_foreign_repay numeric(20,3),
    state_comp_managed_funds numeric(20,3),
    state_comp_debt_repay numeric(20,3),
    state_comp_capital_exp numeric(20,3),
    state_comp_exp_total numeric(20,3),
    state_comp_double_counted numeric(20,3),
    state_comp_net numeric(20,3),
    state_comp_current_assets_increase numeric(20,3)
);


ALTER TABLE public.expenditures OWNER TO hamidreza;

--
-- Name: revenues; Type: TABLE; Schema: public; Owner: hamidreza
--

CREATE TABLE public.revenues (
    revenue_id integer NOT NULL,
    year_id integer,
    total numeric(20,3),
    tax_total numeric(20,3),
    oil_gas numeric(20,3),
    other numeric(20,3),
    tax_corporate numeric(20,3),
    tax_individual numeric(20,3),
    tax_payroll numeric(20,3),
    tax_social_security numeric(20,3),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    asset_sales numeric(20,3) DEFAULT 0,
    borrowing numeric(20,3) DEFAULT 0,
    development_fund numeric(20,3) DEFAULT 0,
    special_accounts numeric(20,3) DEFAULT 0,
    operational_revenue numeric(20,3),
    state_comp_revenues numeric(20,3),
    state_comp_current_credits numeric(20,3),
    state_comp_capital_credits numeric(20,3),
    state_comp_domestic_loans numeric(20,3),
    state_comp_foreign_loans numeric(20,3),
    state_comp_current_assets numeric(20,3),
    state_comp_other_receipts numeric(20,3),
    state_comp_financial_assets numeric(20,3),
    state_comp_revenue_total numeric(20,3)
);


ALTER TABLE public.revenues OWNER TO hamidreza;

--
-- Name: COLUMN revenues.total; Type: COMMENT; Schema: public; Owner: hamidreza
--

COMMENT ON COLUMN public.revenues.total IS 'Total revenues including operational + asset sales + borrowing + special accounts';


--
-- Name: COLUMN revenues.tax_total; Type: COMMENT; Schema: public; Owner: hamidreza
--

COMMENT ON COLUMN public.revenues.tax_total IS 'Total tax revenues (all categories combined)';


--
-- Name: COLUMN revenues.oil_gas; Type: COMMENT; Schema: public; Owner: hamidreza
--

COMMENT ON COLUMN public.revenues.oil_gas IS 'Oil and gas export revenues';


--
-- Name: COLUMN revenues.other; Type: COMMENT; Schema: public; Owner: hamidreza
--

COMMENT ON COLUMN public.revenues.other IS 'Other operational revenues (fees, state enterprises, etc.)';


--
-- Name: COLUMN revenues.asset_sales; Type: COMMENT; Schema: public; Owner: hamidreza
--

COMMENT ON COLUMN public.revenues.asset_sales IS 'واگذاری دارایی‌های سرمایه‌ای - Asset sales (capital assets)';


--
-- Name: COLUMN revenues.borrowing; Type: COMMENT; Schema: public; Owner: hamidreza
--

COMMENT ON COLUMN public.revenues.borrowing IS 'استقراض - Government borrowing';


--
-- Name: COLUMN revenues.development_fund; Type: COMMENT; Schema: public; Owner: hamidreza
--

COMMENT ON COLUMN public.revenues.development_fund IS 'برداشت از صندوق توسعه ملی - National Development Fund withdrawals';


--
-- Name: COLUMN revenues.special_accounts; Type: COMMENT; Schema: public; Owner: hamidreza
--

COMMENT ON COLUMN public.revenues.special_accounts IS 'حساب‌های ویژه - Special government accounts';


--
-- Name: COLUMN revenues.operational_revenue; Type: COMMENT; Schema: public; Owner: hamidreza
--

COMMENT ON COLUMN public.revenues.operational_revenue IS 'درآمدهای عملیاتی - Operational revenues (tax + oil + other)';


--
-- Name: budget_overview; Type: VIEW; Schema: public; Owner: hamidreza
--

CREATE VIEW public.budget_overview AS
 SELECT y.year_persian,
    y.year_gregorian,
    y.currency,
    y.data_source,
    r.total AS revenue_total,
    r.tax_total,
    r.oil_gas,
    r.other AS revenue_other,
    e.total AS expenditure_total,
    e.current_exp,
    e.capital_exp,
    e.unclassified,
    e.subsidy_spending,
    b.surplus_deficit,
    b.status
   FROM (((public.years y
     LEFT JOIN public.revenues r ON ((y.year_id = r.year_id)))
     LEFT JOIN public.expenditures e ON ((y.year_id = e.year_id)))
     LEFT JOIN public.budget_balance b ON ((y.year_id = b.year_id)))
  ORDER BY y.year_persian;


ALTER VIEW public.budget_overview OWNER TO hamidreza;

--
-- Name: budget_overview_detailed; Type: VIEW; Schema: public; Owner: hamidreza
--

CREATE VIEW public.budget_overview_detailed AS
 SELECT y.year_persian,
    y.year_gregorian,
    y.currency,
    y.data_source,
    y.revenue_scope,
    y.expenditure_scope,
    r.tax_total,
    r.oil_gas,
    r.other AS operational_other,
    r.operational_revenue,
    r.asset_sales,
    r.borrowing,
    r.development_fund,
    r.special_accounts,
    r.total AS total_revenue,
    e.total AS expenditure_total,
    e.current_exp,
    e.capital_exp,
    e.unclassified,
    e.subsidy_spending,
    b.surplus_deficit,
    b.status
   FROM (((public.years y
     LEFT JOIN public.revenues r ON ((y.year_id = r.year_id)))
     LEFT JOIN public.expenditures e ON ((y.year_id = e.year_id)))
     LEFT JOIN public.budget_balance b ON ((y.year_id = b.year_id)))
  ORDER BY y.year_persian;


ALTER VIEW public.budget_overview_detailed OWNER TO hamidreza;

--
-- Name: budget_scope_notes; Type: TABLE; Schema: public; Owner: hamidreza
--

CREATE TABLE public.budget_scope_notes (
    note_id integer NOT NULL,
    year_id integer,
    category character varying(50),
    scope_type character varying(100),
    included_items text[],
    excluded_items text[],
    percentage_of_total numeric(5,2),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.budget_scope_notes OWNER TO hamidreza;

--
-- Name: budget_scope_notes_note_id_seq; Type: SEQUENCE; Schema: public; Owner: hamidreza
--

CREATE SEQUENCE public.budget_scope_notes_note_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.budget_scope_notes_note_id_seq OWNER TO hamidreza;

--
-- Name: budget_scope_notes_note_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hamidreza
--

ALTER SEQUENCE public.budget_scope_notes_note_id_seq OWNED BY public.budget_scope_notes.note_id;


--
-- Name: data_quality_notes; Type: TABLE; Schema: public; Owner: hamidreza
--

CREATE TABLE public.data_quality_notes (
    note_id integer NOT NULL,
    table_name character varying(50),
    year_persian integer,
    note_type character varying(20),
    note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.data_quality_notes OWNER TO hamidreza;

--
-- Name: data_quality_notes_note_id_seq; Type: SEQUENCE; Schema: public; Owner: hamidreza
--

CREATE SEQUENCE public.data_quality_notes_note_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.data_quality_notes_note_id_seq OWNER TO hamidreza;

--
-- Name: data_quality_notes_note_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hamidreza
--

ALTER SEQUENCE public.data_quality_notes_note_id_seq OWNED BY public.data_quality_notes.note_id;


--
-- Name: expenditure_analysis; Type: VIEW; Schema: public; Owner: hamidreza
--

CREATE VIEW public.expenditure_analysis AS
 SELECT y.year_persian,
    y.year_gregorian,
    e.total AS total_expenditure,
    e.current_exp,
    e.capital_exp,
    e.unclassified,
    e.subsidy_spending,
    round(((e.current_exp / e.total) * (100)::numeric), 2) AS current_percentage,
    round(((e.capital_exp / e.total) * (100)::numeric), 2) AS capital_percentage,
    round(((e.subsidy_spending / e.total) * (100)::numeric), 2) AS subsidy_percentage
   FROM (public.years y
     LEFT JOIN public.expenditures e ON ((y.year_id = e.year_id)))
  ORDER BY y.year_persian;


ALTER VIEW public.expenditure_analysis OWNER TO hamidreza;

--
-- Name: expenditures_expenditure_id_seq; Type: SEQUENCE; Schema: public; Owner: hamidreza
--

CREATE SEQUENCE public.expenditures_expenditure_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenditures_expenditure_id_seq OWNER TO hamidreza;

--
-- Name: expenditures_expenditure_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hamidreza
--

ALTER SEQUENCE public.expenditures_expenditure_id_seq OWNED BY public.expenditures.expenditure_id;


--
-- Name: operational_revenues_view; Type: VIEW; Schema: public; Owner: hamidreza
--

CREATE VIEW public.operational_revenues_view AS
 SELECT y.year_persian,
    y.year_gregorian,
    r.operational_revenue,
    r.tax_total,
    r.oil_gas,
    r.other,
    round(((r.tax_total / NULLIF(r.operational_revenue, (0)::numeric)) * (100)::numeric), 2) AS tax_percentage,
    round(((r.oil_gas / NULLIF(r.operational_revenue, (0)::numeric)) * (100)::numeric), 2) AS oil_percentage,
    round(((r.other / NULLIF(r.operational_revenue, (0)::numeric)) * (100)::numeric), 2) AS other_percentage
   FROM (public.years y
     JOIN public.revenues r ON ((y.year_id = r.year_id)))
  ORDER BY y.year_persian;


ALTER VIEW public.operational_revenues_view OWNER TO hamidreza;

--
-- Name: revenue_trends; Type: VIEW; Schema: public; Owner: hamidreza
--

CREATE VIEW public.revenue_trends AS
 SELECT y.year_persian,
    y.year_gregorian,
    r.total AS total_revenue,
    r.tax_total,
    r.oil_gas,
    round(((r.oil_gas / r.total) * (100)::numeric), 2) AS oil_gas_percentage,
    round(((r.tax_total / r.total) * (100)::numeric), 2) AS tax_percentage,
    r.tax_corporate,
    r.tax_individual,
    r.tax_payroll,
    r.tax_social_security
   FROM (public.years y
     LEFT JOIN public.revenues r ON ((y.year_id = r.year_id)))
  ORDER BY y.year_persian;


ALTER VIEW public.revenue_trends OWNER TO hamidreza;

--
-- Name: revenues_revenue_id_seq; Type: SEQUENCE; Schema: public; Owner: hamidreza
--

CREATE SEQUENCE public.revenues_revenue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.revenues_revenue_id_seq OWNER TO hamidreza;

--
-- Name: revenues_revenue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hamidreza
--

ALTER SEQUENCE public.revenues_revenue_id_seq OWNED BY public.revenues.revenue_id;


--
-- Name: years_year_id_seq; Type: SEQUENCE; Schema: public; Owner: hamidreza
--

CREATE SEQUENCE public.years_year_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.years_year_id_seq OWNER TO hamidreza;

--
-- Name: years_year_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hamidreza
--

ALTER SEQUENCE public.years_year_id_seq OWNED BY public.years.year_id;


--
-- Name: yoy_growth; Type: VIEW; Schema: public; Owner: hamidreza
--

CREATE VIEW public.yoy_growth AS
 WITH yearly_totals AS (
         SELECT y.year_persian,
            r.total AS revenue,
            e.total AS expenditure,
            b.surplus_deficit AS balance
           FROM (((public.years y
             LEFT JOIN public.revenues r ON ((y.year_id = r.year_id)))
             LEFT JOIN public.expenditures e ON ((y.year_id = e.year_id)))
             LEFT JOIN public.budget_balance b ON ((y.year_id = b.year_id)))
        )
 SELECT current.year_persian,
    current.revenue,
    previous.revenue AS prev_revenue,
    round(
        CASE
            WHEN (previous.revenue > (0)::numeric) THEN (((current.revenue - previous.revenue) / previous.revenue) * (100)::numeric)
            ELSE NULL::numeric
        END, 2) AS revenue_growth_pct,
    current.expenditure,
    previous.expenditure AS prev_expenditure,
    round(
        CASE
            WHEN (previous.expenditure > (0)::numeric) THEN (((current.expenditure - previous.expenditure) / previous.expenditure) * (100)::numeric)
            ELSE NULL::numeric
        END, 2) AS expenditure_growth_pct
   FROM (yearly_totals current
     LEFT JOIN yearly_totals previous ON ((current.year_persian = (previous.year_persian + 1))))
  ORDER BY current.year_persian;


ALTER VIEW public.yoy_growth OWNER TO hamidreza;

--
-- Name: budget_balance balance_id; Type: DEFAULT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.budget_balance ALTER COLUMN balance_id SET DEFAULT nextval('public.budget_balance_balance_id_seq'::regclass);


--
-- Name: budget_scope_notes note_id; Type: DEFAULT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.budget_scope_notes ALTER COLUMN note_id SET DEFAULT nextval('public.budget_scope_notes_note_id_seq'::regclass);


--
-- Name: data_quality_notes note_id; Type: DEFAULT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.data_quality_notes ALTER COLUMN note_id SET DEFAULT nextval('public.data_quality_notes_note_id_seq'::regclass);


--
-- Name: expenditures expenditure_id; Type: DEFAULT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.expenditures ALTER COLUMN expenditure_id SET DEFAULT nextval('public.expenditures_expenditure_id_seq'::regclass);


--
-- Name: revenues revenue_id; Type: DEFAULT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.revenues ALTER COLUMN revenue_id SET DEFAULT nextval('public.revenues_revenue_id_seq'::regclass);


--
-- Name: years year_id; Type: DEFAULT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.years ALTER COLUMN year_id SET DEFAULT nextval('public.years_year_id_seq'::regclass);


--
-- Data for Name: budget_balance; Type: TABLE DATA; Schema: public; Owner: hamidreza
--

COPY public.budget_balance (balance_id, year_id, surplus_deficit, status, created_at, updated_at) FROM stdin;
1	1	-147739.231	deficit	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517
2	2	-183748.958	deficit	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517
3	3	-192507.782	deficit	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517
4	4	-323460.833	deficit	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517
5	5	-398692.792	deficit	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517
6	6	-1108097.800	deficit	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517
7	7	-818043.671	deficit	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517
8	8	1196967.549	surplus	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517
9	9	-910841.100	deficit	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517
10	10	-4280000.000	deficit	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517
\.


--
-- Data for Name: budget_scope_notes; Type: TABLE DATA; Schema: public; Owner: hamidreza
--

COPY public.budget_scope_notes (note_id, year_id, category, scope_type, included_items, excluded_items, percentage_of_total, notes, created_at) FROM stdin;
1	1	revenue	operational_only	{"Tax revenues","Oil & gas revenues","Other operational revenues"}	{"Asset sales",Borrowing,"Development fund","Financial operations"}	50.80	Data from CSV files contains only operational revenues (~51% of منابع عمومی)	2025-12-30 22:08:07.292462
2	2	revenue	operational_only	{"Tax revenues","Oil & gas revenues","Other operational revenues"}	{"Asset sales",Borrowing,"Development fund","Financial operations"}	50.80	Data from CSV files contains only operational revenues (~51% of منابع عمومی)	2025-12-30 22:08:07.292462
3	3	revenue	operational_only	{"Tax revenues","Oil & gas revenues","Other operational revenues"}	{"Asset sales",Borrowing,"Development fund","Financial operations"}	50.80	Data from CSV files contains only operational revenues (~51% of منابع عمومی)	2025-12-30 22:08:07.292462
4	4	revenue	operational_only	{"Tax revenues","Oil & gas revenues","Other operational revenues"}	{"Asset sales",Borrowing,"Development fund","Financial operations"}	50.80	Data from CSV files contains only operational revenues (~51% of منابع عمومی)	2025-12-30 22:08:07.292462
5	5	revenue	operational_only	{"Tax revenues","Oil & gas revenues","Other operational revenues"}	{"Asset sales",Borrowing,"Development fund","Financial operations"}	50.80	Data from CSV files contains only operational revenues (~51% of منابع عمومی)	2025-12-30 22:08:07.292462
6	6	revenue	operational_only	{"Tax revenues","Oil & gas revenues","Other operational revenues"}	{"Asset sales",Borrowing,"Development fund","Financial operations"}	50.80	Data from CSV files contains only operational revenues (~51% of منابع عمومی)	2025-12-30 22:08:07.292462
7	7	revenue	operational_only	{"Tax revenues","Oil & gas revenues","Other operational revenues"}	{"Asset sales",Borrowing,"Development fund","Financial operations"}	50.80	Data from CSV files contains only operational revenues (~51% of منابع عمومی)	2025-12-30 22:08:07.292462
8	8	revenue	operational_only	{"Tax revenues","Oil & gas revenues","Other operational revenues"}	{"Asset sales",Borrowing,"Development fund","Financial operations"}	50.80	Data from CSV files contains only operational revenues (~51% of منابع عمومی)	2025-12-30 22:08:07.292462
9	9	revenue	operational_only	{"Tax revenues","Oil & gas revenues","Other operational revenues"}	{"Asset sales",Borrowing,"Development fund","Financial operations"}	50.80	Data from CSV files contains only operational revenues (~51% of منابع عمومی)	2025-12-30 22:08:07.292462
\.


--
-- Data for Name: data_quality_notes; Type: TABLE DATA; Schema: public; Owner: hamidreza
--

COPY public.data_quality_notes (note_id, table_name, year_persian, note_type, note, created_at) FROM stdin;
1	general	\N	info	All monetary values are in billion rials	2025-12-29 18:09:07.738668
2	revenues	1404	warning	Year 1404 uses broader tax categories due to source limitations	2025-12-29 18:09:07.738668
3	expenditures	\N	info	Some years have zero values for certain categories (e.g., payroll tax not separately reported)	2025-12-29 18:09:07.738668
4	revenues	\N	scope	Years 1395-1403: Contains operational revenues only (~51% of منابع عمومی). Missing: asset sales, borrowing, development fund withdrawals.	2025-12-30 22:08:07.3155
5	revenues	1404	scope	Year 1404: Contains full منابع عمومی (general resources). Operational revenues only.	2025-12-30 22:08:07.3155
6	revenues	\N	info	operational_revenue = tax_total + oil_gas + other (consistent across all years)	2025-12-30 22:08:07.3155
7	revenues	\N	info	For years 1395-1403: total = operational_revenue (asset_sales, borrowing = 0)	2025-12-30 22:08:07.3155
8	revenues	\N	info	To get full منابع عمومی: multiply operational_revenue by ~1.95 (approximate)	2025-12-30 22:08:07.3155
\.


--
-- Data for Name: expenditures; Type: TABLE DATA; Schema: public; Owner: hamidreza
--

COPY public.expenditures (expenditure_id, year_id, total, current_exp, capital_exp, unclassified, subsidy_spending, created_at, updated_at, state_comp_current_exp, state_comp_taxes, state_comp_special_dividend, state_comp_dividends, state_comp_other_profit, state_comp_domestic_repay, state_comp_foreign_repay, state_comp_managed_funds, state_comp_debt_repay, state_comp_capital_exp, state_comp_exp_total, state_comp_double_counted, state_comp_net, state_comp_current_assets_increase) FROM stdin;
9	9	64587124.000	1585.700	853990.500	13074486.400	23114.500	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	28538551.231	233102.640	363308.739	112555.433	1060.071	1092139.076	392432.784	11033.884	775447.511	6926791.727	38836142.934	1419418.937	37416724.000	\N
6	6	28823398.457	188.620	762802.150	6407142.260	6817.820	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	10835832.000	72128.000	94027.000	59441.000	762.000	665146.000	205727.000	8279.000	866656.000	326943.000	16131095.000	417877.000	15713218.000	62155.000
7	7	37587793.931	491.000	1746914.267	5806206.147	2765.032	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	15170197.000	116093.000	147819.000	101028.000	470.000	1222925.000	350200.000	13350.000	930396.000	479874.000	22314080.000	593483.000	21720597.000	58312.000
8	8	49947144.083	1008.092	274179.930	10625762.557	63449.866	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	22115525.000	142891.000	182874.000	119580.000	606.000	1933857.000	485233.000	11006.000	1217146.000	579942.000	30976965.000	0.000	30976965.000	88919.000
10	10	112795309.000	22676000.000	20700000.000	10469000.000	10500000.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	48592390.948	373349.819	668738.652	126747.346	4338.500	1443494.045	90088.517	33411.540	1005840.993	12307377.328	65731701.418	2003944.418	63732759.000	534448.850
5	5	20176016.794	6407771.216	0.000	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	14359225.578	\N
4	4	17443160.230	5200083.652	0.000	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	12771433.156	\N
3	3	12231523.740	4438604.668	0.000	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8391247.284	\N
2	2	10849392.934	3711236.941	0.000	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	7565401.636	\N
1	1	9785529.974	3354895.145	0.000	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6430634.829	\N
\.


--
-- Data for Name: revenues; Type: TABLE DATA; Schema: public; Owner: hamidreza
--

COPY public.revenues (revenue_id, year_id, total, tax_total, oil_gas, other, tax_corporate, tax_individual, tax_payroll, tax_social_security, created_at, updated_at, asset_sales, borrowing, development_fund, special_accounts, operational_revenue, state_comp_revenues, state_comp_current_credits, state_comp_capital_credits, state_comp_domestic_loans, state_comp_foreign_loans, state_comp_current_assets, state_comp_other_receipts, state_comp_financial_assets, state_comp_revenue_total) FROM stdin;
9	9	64587124.000	3925897.600	1230115.300	7863208.600	908760.800	935199.900	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	6445630.000	3191770.000	0.000	2751000.000	15983000.000	30178537.345	237393.820	906258.943	1101969.937	349059.038	345786.412	4206759.517	476690.755	37415723.997
10	10	112795309.000	17000000.000	21070000.000	11495000.000	8166500.000	1818200.000	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	4280000.000	49565000.000	50443498.900	377567.118	163436.264	4587410.738	882363.503	847260.604	7250639.871	0.000	63732759.000
8	8	49947144.083	3628457.001	1845734.547	6623726.580	916767.281	632355.874	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	1811605.450	20823312.664	24167724.000	100275.000	514226.000	1204452.000	657298.000	371737.000	3961253.000	0.000	28839107.258
7	7	37587793.931	1597349.067	794648.906	4343569.770	269589.106	307816.379	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	1332396.113	13941318.500	16305401.000	77201.000	440087.000	1155981.000	709211.000	616142.000	3010057.000	0.000	22314079.318
6	6	28823398.457	989516.880	721092.120	4351426.230	119389.160	145738.240	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	958489.912	12779209.356	11411175.000	72916.000	269079.000	846746.000	617946.000	534501.000	1960855.000	0.000	15713217.843
5	5	20176016.794	594817.825	115812.250	1867296.610	88453.797	97272.610	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	797873.485	5609897.559	\N	\N	\N	\N	\N	\N	\N	\N	14359225.578
4	4	17443160.230	470796.845	303315.444	1375385.615	74428.283	80780.026	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	714272.498	4485811.154	\N	\N	\N	\N	\N	\N	\N	\N	12771433.156
3	3	12231523.740	393206.104	213500.481	1289040.926	72658.048	77258.689	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	570738.519	3867866.149	\N	\N	\N	\N	\N	\N	\N	\N	8391247.284
2	2	10849392.934	344018.801	224684.130	1087606.684	72212.960	75726.174	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	511246.941	3199990.000	\N	\N	\N	\N	\N	\N	\N	\N	7565401.636
1	1	9785529.974	314080.388	154842.206	1033523.177	67537.500	71480.189	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	0.000	3354895.145	\N	\N	\N	\N	\N	\N	\N	\N	6430634.829
\.


--
-- Data for Name: years; Type: TABLE DATA; Schema: public; Owner: hamidreza
--

COPY public.years (year_id, year_persian, year_gregorian, currency, data_source, created_at, updated_at, revenue_scope, expenditure_scope) FROM stdin;
1	1395	774-775	billion rials	CSV data from official budget tables	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	operational_only	government_general
2	1396	775-776	billion rials	CSV data from official budget tables	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	operational_only	government_general
3	1397	776-777	billion rials	CSV data from official budget tables	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	operational_only	government_general
4	1398	777-778	billion rials	CSV data from official budget tables	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	operational_only	government_general
5	1399	778-779	billion rials	CSV data from official budget tables	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	operational_only	government_general
6	1400	779-780	billion rials	CSV data from official budget tables	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	operational_only	government_general
7	1401	780-781	billion rials	CSV data from official budget tables	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	operational_only	government_general
8	1402	781-782	billion rials	CSV data from official budget tables	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	operational_only	government_general
9	1403	782-783	billion rials	CSV data from official budget tables	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	Full National Budget	government_general
10	1404	2025-2026	billion rials	Budget law (Part 1) + official web sources	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	Full National Budget	government_general
\.


--
-- Name: budget_balance_balance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hamidreza
--

SELECT pg_catalog.setval('public.budget_balance_balance_id_seq', 10, true);


--
-- Name: budget_scope_notes_note_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hamidreza
--

SELECT pg_catalog.setval('public.budget_scope_notes_note_id_seq', 9, true);


--
-- Name: data_quality_notes_note_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hamidreza
--

SELECT pg_catalog.setval('public.data_quality_notes_note_id_seq', 8, true);


--
-- Name: expenditures_expenditure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hamidreza
--

SELECT pg_catalog.setval('public.expenditures_expenditure_id_seq', 10, true);


--
-- Name: revenues_revenue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hamidreza
--

SELECT pg_catalog.setval('public.revenues_revenue_id_seq', 10, true);


--
-- Name: years_year_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hamidreza
--

SELECT pg_catalog.setval('public.years_year_id_seq', 10, true);


--
-- Name: budget_balance budget_balance_pkey; Type: CONSTRAINT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.budget_balance
    ADD CONSTRAINT budget_balance_pkey PRIMARY KEY (balance_id);


--
-- Name: budget_balance budget_balance_year_id_key; Type: CONSTRAINT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.budget_balance
    ADD CONSTRAINT budget_balance_year_id_key UNIQUE (year_id);


--
-- Name: budget_scope_notes budget_scope_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.budget_scope_notes
    ADD CONSTRAINT budget_scope_notes_pkey PRIMARY KEY (note_id);


--
-- Name: data_quality_notes data_quality_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.data_quality_notes
    ADD CONSTRAINT data_quality_notes_pkey PRIMARY KEY (note_id);


--
-- Name: expenditures expenditures_pkey; Type: CONSTRAINT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.expenditures
    ADD CONSTRAINT expenditures_pkey PRIMARY KEY (expenditure_id);


--
-- Name: expenditures expenditures_year_id_key; Type: CONSTRAINT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.expenditures
    ADD CONSTRAINT expenditures_year_id_key UNIQUE (year_id);


--
-- Name: revenues revenues_pkey; Type: CONSTRAINT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT revenues_pkey PRIMARY KEY (revenue_id);


--
-- Name: revenues revenues_year_id_key; Type: CONSTRAINT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT revenues_year_id_key UNIQUE (year_id);


--
-- Name: years years_pkey; Type: CONSTRAINT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.years
    ADD CONSTRAINT years_pkey PRIMARY KEY (year_id);


--
-- Name: years years_year_persian_key; Type: CONSTRAINT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.years
    ADD CONSTRAINT years_year_persian_key UNIQUE (year_persian);


--
-- Name: idx_balance_deficit; Type: INDEX; Schema: public; Owner: hamidreza
--

CREATE INDEX idx_balance_deficit ON public.budget_balance USING btree (surplus_deficit);


--
-- Name: idx_balance_status; Type: INDEX; Schema: public; Owner: hamidreza
--

CREATE INDEX idx_balance_status ON public.budget_balance USING btree (status);


--
-- Name: idx_balance_year; Type: INDEX; Schema: public; Owner: hamidreza
--

CREATE INDEX idx_balance_year ON public.budget_balance USING btree (year_id);


--
-- Name: idx_expenditures_current; Type: INDEX; Schema: public; Owner: hamidreza
--

CREATE INDEX idx_expenditures_current ON public.expenditures USING btree (current_exp);


--
-- Name: idx_expenditures_total; Type: INDEX; Schema: public; Owner: hamidreza
--

CREATE INDEX idx_expenditures_total ON public.expenditures USING btree (total);


--
-- Name: idx_expenditures_year; Type: INDEX; Schema: public; Owner: hamidreza
--

CREATE INDEX idx_expenditures_year ON public.expenditures USING btree (year_id);


--
-- Name: idx_revenues_asset_sales; Type: INDEX; Schema: public; Owner: hamidreza
--

CREATE INDEX idx_revenues_asset_sales ON public.revenues USING btree (asset_sales);


--
-- Name: idx_revenues_borrowing; Type: INDEX; Schema: public; Owner: hamidreza
--

CREATE INDEX idx_revenues_borrowing ON public.revenues USING btree (borrowing);


--
-- Name: idx_revenues_oil_gas; Type: INDEX; Schema: public; Owner: hamidreza
--

CREATE INDEX idx_revenues_oil_gas ON public.revenues USING btree (oil_gas);


--
-- Name: idx_revenues_tax; Type: INDEX; Schema: public; Owner: hamidreza
--

CREATE INDEX idx_revenues_tax ON public.revenues USING btree (tax_total);


--
-- Name: idx_revenues_total; Type: INDEX; Schema: public; Owner: hamidreza
--

CREATE INDEX idx_revenues_total ON public.revenues USING btree (total);


--
-- Name: idx_revenues_year; Type: INDEX; Schema: public; Owner: hamidreza
--

CREATE INDEX idx_revenues_year ON public.revenues USING btree (year_id);


--
-- Name: idx_years_gregorian; Type: INDEX; Schema: public; Owner: hamidreza
--

CREATE INDEX idx_years_gregorian ON public.years USING btree (year_gregorian);


--
-- Name: idx_years_persian; Type: INDEX; Schema: public; Owner: hamidreza
--

CREATE INDEX idx_years_persian ON public.years USING btree (year_persian);


--
-- Name: budget_balance budget_balance_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.budget_balance
    ADD CONSTRAINT budget_balance_year_id_fkey FOREIGN KEY (year_id) REFERENCES public.years(year_id) ON DELETE CASCADE;


--
-- Name: budget_scope_notes budget_scope_notes_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.budget_scope_notes
    ADD CONSTRAINT budget_scope_notes_year_id_fkey FOREIGN KEY (year_id) REFERENCES public.years(year_id) ON DELETE CASCADE;


--
-- Name: expenditures expenditures_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.expenditures
    ADD CONSTRAINT expenditures_year_id_fkey FOREIGN KEY (year_id) REFERENCES public.years(year_id) ON DELETE CASCADE;


--
-- Name: revenues revenues_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamidreza
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT revenues_year_id_fkey FOREIGN KEY (year_id) REFERENCES public.years(year_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict IPAjVkIpNLiiJiksxd1m7CGfYWaEpdsNVAsD8YxGXgl9EOpJqjJ6sGhf4h2tmaU

