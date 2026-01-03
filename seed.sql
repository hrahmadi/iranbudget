--
-- PostgreSQL database dump
--

\restrict ET2VPDq3mOjIOPh0TARrSVugd6eoHvXemr5hz0EAYcq0mGesOf3StLhh2dc3LoN

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
10	10	0.000	deficit	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517
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
10	10	112795309.000	22676000.000	20700000.000	10469000.000	10500000.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	48592390.948	373349.819	668738.652	126747.346	4338.500	1443494.045	90088.517	33411.540	1005840.993	12307377.328	65731701.418	2003944.418	63732759.000	534448.850
9	9	64587124.000	1585.700	853990.500	13074486.400	23114.500	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	28538551.231	233102.640	363308.739	112555.433	1060.071	1092139.076	392432.784	11033.884	775447.511	6926791.727	38836142.934	1419418.937	37416724.000	\N
6	6	28823398.457	188.620	762802.150	6407142.260	6817.820	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	10835832.000	72128.000	94027.000	59441.000	762.000	665146.000	205727.000	8279.000	866656.000	326943.000	16131095.000	417877.000	15713218.000	62155.000
7	7	37587793.931	491.000	1746914.267	5806206.147	2765.032	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	15170197.000	116093.000	147819.000	101028.000	470.000	1222925.000	350200.000	13350.000	930396.000	479874.000	22314080.000	593483.000	21720597.000	58312.000
8	8	49947144.083	1008.092	274179.930	10625762.557	63449.866	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	22115525.000	142891.000	182874.000	119580.000	606.000	1933857.000	485233.000	11006.000	1217146.000	579942.000	30976965.000	0.000	30976965.000	88919.000
5	5	20176016.794	6407771.216	0.000	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	14359225.578	\N
4	4	17443160.230	5200083.652	0.000	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	12771433.156	\N
3	3	12231523.740	4438604.668	0.000	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8391247.284	\N
2	2	10849392.934	3711236.941	0.000	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	7565401.636	\N
1	1	9785529.974	3354895.145	0.000	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6430634.829	\N
\.


--
-- Data for Name: revenues; Type: TABLE DATA; Schema: public; Owner: hamidreza
--

COPY public.revenues (revenue_id, year_id, total, tax_total, oil_gas, other, tax_corporate, tax_individual, tax_payroll, tax_social_security, created_at, updated_at, asset_sales, borrowing, development_fund, special_accounts, operational_revenue, state_comp_revenues, state_comp_current_credits, state_comp_capital_credits, state_comp_domestic_loans, state_comp_foreign_loans, state_comp_current_assets, state_comp_other_receipts, state_comp_financial_assets, state_comp_revenue_total, tax_vat_sales, tax_wealth, tax_import_duties, oil_exports, gas_condensate, ministry_revenue) FROM stdin;
9	9	64587124.000	3925897.600	1230115.300	7863208.600	908760.800	935199.900	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	6445630.000	3191770.000	0.000	2751000.000	15983000.000	30178537.345	237393.820	906258.943	1101969.937	349059.038	345786.412	4206759.517	476690.755	37415723.997	\N	\N	\N	\N	\N	\N
8	8	49947144.083	3628457.001	1845734.547	6623726.580	916767.281	632355.874	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	1811605.450	20823312.664	24167724.000	100275.000	514226.000	1204452.000	657298.000	371737.000	3961253.000	0.000	28839107.258	\N	\N	\N	\N	\N	\N
7	7	37587793.931	1597349.067	794648.906	4343569.770	269589.106	307816.379	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	1332396.113	13941318.500	16305401.000	77201.000	440087.000	1155981.000	709211.000	616142.000	3010057.000	0.000	22314079.318	\N	\N	\N	\N	\N	\N
6	6	28823398.457	989516.880	721092.120	4351426.230	119389.160	145738.240	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	958489.912	12779209.356	11411175.000	72916.000	269079.000	846746.000	617946.000	534501.000	1960855.000	0.000	15713217.843	\N	\N	\N	\N	\N	\N
5	5	20176016.794	594817.825	115812.250	1867296.610	88453.797	97272.610	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	797873.485	5609897.559	\N	\N	\N	\N	\N	\N	\N	\N	14359225.578	\N	\N	\N	\N	\N	\N
4	4	17443160.230	470796.845	303315.444	1375385.615	74428.283	80780.026	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	714272.498	4485811.154	\N	\N	\N	\N	\N	\N	\N	\N	12771433.156	\N	\N	\N	\N	\N	\N
3	3	12231523.740	393206.104	213500.481	1289040.926	72658.048	77258.689	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	570738.519	3867866.149	\N	\N	\N	\N	\N	\N	\N	\N	8391247.284	\N	\N	\N	\N	\N	\N
2	2	10849392.934	344018.801	224684.130	1087606.684	72212.960	75726.174	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	511246.941	3199990.000	\N	\N	\N	\N	\N	\N	\N	\N	7565401.636	\N	\N	\N	\N	\N	\N
1	1	9785529.974	314080.388	154842.206	1033523.177	67537.500	71480.189	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	0.000	3354895.145	\N	\N	\N	\N	\N	\N	\N	\N	6430634.829	\N	\N	\N	\N	\N	\N
10	10	112795309.000	17000000.000	21070000.000	11495000.000	8166500.000	2593000.000	0.000	0.000	2025-12-29 18:10:18.631517	2025-12-29 18:10:18.631517	0.000	0.000	0.000	4280000.000	57565000.000	50443498.900	377567.118	163436.264	4587410.738	882363.503	847260.604	7250639.871	0.000	63732759.000	3608500.000	444000.000	2188000.000	18300000.000	2770000.000	\N
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
-- PostgreSQL database dump complete
--

\unrestrict ET2VPDq3mOjIOPh0TARrSVugd6eoHvXemr5hz0EAYcq0mGesOf3StLhh2dc3LoN

